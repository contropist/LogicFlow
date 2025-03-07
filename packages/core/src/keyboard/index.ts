import { isArray } from 'lodash-es';
import Mousetrap, { MousetrapInstance } from 'mousetrap';
import LogicFlow from '../LogicFlow';

export type Action = 'keypress' | 'keydown' | 'keyup';
export type Handler = (e: KeyboardEvent) => void;
export interface KeyboardDef {
  enabled: boolean,
  shortcuts?: Array<{
    keys: string | string[],
    callback: Handler,
    action?: Action,
  }>
}

export interface Options {
  lf: LogicFlow
  keyboard?: KeyboardDef
}

class Keyboard {
  public readonly mousetrap: MousetrapInstance;
  public options: Options;
  private target: HTMLElement;
  constructor(options: Options) {
    if (!options.keyboard) {
      options.keyboard = { enabled: false };
    }
    this.options = options;
    const { lf } = options;
    this.target = lf.container;
    this.mousetrap = new Mousetrap();
    if (options.keyboard.enabled) {
      this.enable(true);
    }
  }

  initShortcuts() {
    const { shortcuts } = this.options.keyboard;
    if (shortcuts) {
      if (isArray(shortcuts)) {
        shortcuts.forEach(({ keys, callback, action }) => this.on(keys, callback, action));
      } else {
        const { keys, callback, action } = shortcuts;
        this.on(keys, callback, action);
      }
    }
  }

  on(
    keys: string | string[],
    callback: Handler,
    action?: Action,
  ) {
    this.mousetrap.bind(this.getKeys(keys), callback, action);
  }

  get disabled() {
    return this.options.keyboard.enabled !== true;
  }

  off(keys: string | string[], action?: Action) {
    this.mousetrap.unbind(this.getKeys(keys), action);
  }

  enable(force: boolean) {
    if (this.disabled || force) {
      this.options.keyboard.enabled = true;
      if (this.target instanceof HTMLElement) {
        this.target.setAttribute('tabindex', '-1');
        // 去掉节点被选中时container出现的边框
        this.target.style.outline = 'none';
      }
    }
  }

  disable() {
    if (!this.disabled) {
      this.options.keyboard.enabled = false;
      if (this.target instanceof HTMLElement) {
        this.target.removeAttribute('tabindex');
      }
    }
  }

  private getKeys(keys: string | string[]) {
    return (Array.isArray(keys) ? keys : [keys]).map((key) => this.formatKey(key));
  }

  protected formatKey(key: string) {
    const formated = key
      .toLowerCase()
      .replace(/\s/g, '')
      .replace('delete', 'del')
      .replace('cmd', 'command');

    return formated;
  }
}

export { Keyboard };
export default Keyboard;
