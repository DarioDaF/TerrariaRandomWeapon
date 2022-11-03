
/**
 * @typedef DynamicElement
 * @property {HTMLElement} element
 * @property {String} originalText
 */

export class DynamicElement {
  constructor(element = null, value = {}, useInnerHTML = false) {
    this.value = value;
    this._element = element;
    this._useInnerHTML = useInnerHTML;
    this.reloadTemplate();
  }
  reloadTemplate() {
    let strTemplate;
    if (this.element === null) {
      strTemplate = "";
    } else if (this.useInnerHTML) {
      strTemplate = this.element.innerHTML;
    } else {
      strTemplate = this.element.innerText;
    }
    this.template = strTemplate.split("%");
    this.update();
  }
  get element() { return this._element; }
  set element(element) {
    this._element = element;
    this.reloadTemplate();
  }
  get useInnerHTML() { return this._useInnerHTML; }
  set useInnerHTML(useInnerHTML) {
    this._useInnerHTML = useInnerHTML;
    this.reloadTemplate();
  } 
  get parent() { return this.element.parentElement; }
  update(v = {}) {
    Object.assign(this.value, v);
    if (this.element === null) {
      return;
    }
    const newText = this.template.map(
      (s, i) => {
        if (i % 2 === 0) {
          return s;
        } else if (s === "") {
          return "%";
        } else {
          return this.value[s];
        }
      }
    ).join("");
    if (this._useInnerHTML) {
      if (this.element.innerHTML !== newText) {
        this.element.innerHTML = newText;
      }
    } else {
      if (this.element.innerText !== newText) {
        this.element.innerText = newText;
      }
    }
  }
};
