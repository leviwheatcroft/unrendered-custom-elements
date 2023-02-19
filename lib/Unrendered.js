const set = require('lodash/set')

class Unrendered extends HTMLElement {
  data = {}
  refs = {}
  on = {}
  observe = {}

  onConnected () {}

  connectedCallback () {
    this.attachEvents()
    this.resolveRefs()
    this.onConnected()
  }

  resolveRefs () {
    Object.entries(this.refs).forEach(([ref, selector]) => {
      const el = this.querySelector(selector)
      this.refs[ref] = el
    })
  }

  attachEvents () {
    [
      'click',
      'input'
    ].forEach((eventType) => {
      this.querySelectorAll(`[on-${eventType}]`).forEach((el) => {
        const handler = this[el.getAttribute(`on-${eventType}`)]
        el.addEventListener(eventType, handler.bind(this))
      })
    })
  }

  set (key, value) {
    if (value === undefined) {
      throw new Error('set value undefined')
    }
    // console.debug('set', key, value)
    set(this.data, key, value)
    this.resolveObservers(key, value)
    this.resolveClassMaps()
  }

  resolveClassMaps () {
    this.querySelectorAll('[class-map]').forEach((el) => {
      const classMap = this.evalWithData(el.getAttribute('class-map'))
      Object.entries(classMap).forEach(([classname, condition]) => {
        if (condition) {
          el.classList.add(classname)
        } else {
          el.classList.remove(classname)
        }
      })
    })
  }

  resolveObservers (key, value) {
    Object.entries(this.observe).forEach(([subject, callback]) => {
      const re = new RegExp(subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      if (re.test(key)) {
        callback(key, value, this.data)
      }
    })
  }

  evalWithData (script) {
    const { data } = this
    // eslint-disable-next-line no-new-func
    const fn = Function(
      ...Object.keys(data),
      `"use strict"; return ${script}`
    )
    return fn(...Object.values(data))
  }

  constructor () {
    super()
  }
}

module.exports = {
  Unrendered
}
