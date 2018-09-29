export default class CommandRegistry {
  constructor(root) {
    this.root = root || document;
    this.registeredCommands = {};
    this.registeredListeners = {};
  }

  add(target, commandName, callback) {
    if (typeof commandName === 'object') {
      const commands = commandName;
      Object.keys(commands).forEach((subcommandName) => {
        const subCallback = commands[subcommandName];
        this.add(target, subcommandName, subCallback);
      });
    } else {
      if (typeof callback !== 'function') {
        throw new Error('Can\'t register a command with non-function callback.');
      }

      if (!this.registeredListeners[commandName]) {
        this.registeredListeners[commandName] = [];
      }

      this.registeredListeners[commandName].push({ target, callback });
      if (this.root && !this.registeredCommands[commandName]) {
        this.root.addEventListener(commandName, this.handleCommandEvent.bind(this), true);
        this.registeredCommands[commandName] = true;
      }
    }
  }

  dispatch(target, commandName, detail) {
    const currentTarget = typeof target === 'string' ? this.root.querySelector(target) : target;
    if (currentTarget) {
      const event = new CustomEvent(commandName, { bubbles: true, detail });
      Object.defineProperty(event, 'target', { value: currentTarget });
      currentTarget.dispatchEvent(event);
    }
  }

  handleCommandEvent(event) {
    const currentTarget = event.target;
    const listeners = this.registeredListeners[event.type];
    if (listeners) {
      listeners.find((listener) => {
        if (typeof listener.target === 'string') {
          listener.target = this.root.querySelector(listener.target);
        }
        return listener.target === currentTarget;
      }).callback(event);
    }
  }
}
