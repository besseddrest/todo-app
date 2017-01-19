// ---------------------------------------------------------------
// ToDoApp
// Sets up the primary DOM elements, then creates either
// the first instance of ToDoList, or
// multiple instances if we have them in local storage
// ---------------------------------------------------------------
class ToDoApp {
  constructor() {
    const header = document.querySelector(`header`);

    // create header element
    const headerElement = new ToDoElement({
      type: 'h1',
      content: 'ToDo App',
      parent: header
    });

    // create button to add list
    const addListBtnElement = new ToDoElement({
      type: 'button',
      classes: ['button', 'button--add-list'],
      events: [{ type: 'click', callback: () => { const newList = new ToDoList() } }],
      content: 'New List',
      parent: header
    });

    // create button to clear local storage
    const clearStorageBtnElement = new ToDoElement({
      type: 'button',
      classes: ['button', 'button--clear-storage'],
      events: [{ type: 'click', callback: () => localStorage.clear() }],
      content: 'Clear Storage',
      parent: header
    });

    // if we have lists in local storage, create those lists
    if (localStorage.length > 0) {
      for (let i = 0; i < localStorage.length; i++){
        // get the key and pass to ToDoList
        const listNumber = parseInt(localStorage.key(i).slice(-1));
        const todo = new ToDoList(listNumber);
      }
    } else {
      const todo = new ToDoList();
    }
  }
}

// ---------------------------------------------------------------
// ToDoList
// Creates a list and all its elements, including a first item
// or, creates lists and its item if they are in local storage
// Local storage is updated when a user:
// - creates a list
// - changes the title or list item
// - removes an item
// - deletes a list
// - marks an item as complete
// ---------------------------------------------------------------
class ToDoList {
  constructor(lastKey) {
    // if we have a key, there is data in local storage
    if (lastKey)
      ToDoApp.key = lastKey;

    this.key = ToDoApp.key++;

    // creates list and its default elements
    this.createList(this.key);
  }

  createList(key) {
    const container = document.querySelector('.container');

    // create list wrapper
    const listElement = new ToDoElement({
      type: 'section',
      attributes: [{ attr: 'id', val: `list-${this.key}` }],
      classes: ['todo-list'],
      parent: container
    });

    // create title, use title in local storage if we have it (editable)
    const storedTitle = JSON.parse(localStorage.getItem(`list-${this.key}`));
    const titleElement = new ToDoElement({
      type: 'input',
      attributes: [{ attr: 'type', val: 'text' }],
      classes: ['todo-list--title'],
      value: (storedTitle) ? storedTitle[0] : `New List`,
      events: [{ type: 'keyup', callback: () => this.updateLocalStorage()}],
      parent: listElement.element
    });

    // create add item button
    const addBtnElement = new ToDoElement({
      type: 'i',
      classes: ['fa', 'fa-plus', 'todo-list--button', 'todo-list--button__add'],
      value: (storedTitle) ? storedTitle[0] : `New List`,
      events: [{ type: 'click', callback: () => this.addItem()}],
      parent: listElement.element
    });

    // create toggle
    const toggleBtnElement = new ToDoElement({
      type: 'a',
      classes: ['todo-list--button', 'todo-list--button__toggle'],
      events: [{ type: 'click', callback: () => this.toggleCompleted()}],
      content: 'hide completed',
      parent: listElement.element
    });

    // create delete list button
    const deleteBtnElement = new ToDoElement({
      type: 'a',
      classes: ['todo-list--button', 'todo-list--button__delete'],
      events: [{ type: 'click', callback: () => this.toggleCompleted()}],
      content: 'delete list',
      parent: listElement.element
    });
    deleteBtnElement.addEvent({
      type: 'click',
      callback: () => this.deleteList(deleteBtnElement.element)
    });

    // create item, or items if they are in local storage
    const storedList = `list-${this.key}`;
    if (localStorage.length > 0 && localStorage.getItem(storedList)) {
      for (let key in localStorage) {
        if (key == storedList) {
          const items = JSON.parse(localStorage[key]);
          for (let i = 0; i < items.length; i++) {
            // skip the first item, which is the stored title
            if (i != 0) {
              this.addItem(items[i].value, items[i].done);
            }
          }
        }
      }
    } else {
      this.addItem();
    }
    this.updateLocalStorage();
  }

  deleteList(button) {
    const list = button.parentNode;
    const container = document.querySelector(`.container`);
    container.removeChild(list);
    localStorage.removeItem(`list-${this.key}`);
  }

  addItem(value, complete) {
    // validate before adding
    if (this.validateItems()) {
      const list = document.querySelector(`#list-${this.key}`);

      // create item wrapper
      const itemElement = new ToDoElement({
        type: 'div',
        classes: (complete) ? ['todo-list--item', 'todo-list--item__done'] : ['todo-list--item'],
        parent: list
      });

      // create checkbox element
      const checkboxBtnElement = new ToDoElement({
        type: 'input',
        attributes: [
          {
            attr: 'type',
            val: 'checkbox'
          },
          {
            attr: 'tabindex',
            val: -1
          },
          {
            attr: 'checked',
            val: (complete) ? true : false
          }
        ],
        classes: ['todo-list--input-check'],
        parent: itemElement.element
      });
      checkboxBtnElement.addEvent({
        type: 'change',
        callback: () => this.handleCheckbox(checkboxBtnElement.element)
      });

      // create text (input) element
      const textInputElement = new ToDoElement({
        type: 'input',
        value: value || '',
        attributes: [{ attr: 'type', val: 'text' }],
        classes: (complete) ? ['todo-list--input-text', 'todo-list--input-text__done'] : ['todo-list--input-text'],
        events: [
          {
            type: 'change',
            callback: this.removeErrorClass
          },
          {
            type: 'keydown',
            callback: (e) => {
              this.updateLocalStorage();
              if (e.keyCode == 9) // listen for Tab key
                this.addItem(); // scope: ToDoList
            }
          },
          {
            type: 'keyup',
            callback: (e) => {
              this.updateLocalStorage();
              if (e.keyCode == 13) // listen for Enter key
                this.addItem(); // scope: ToDoList
            }
          }
        ],
        parent: itemElement.element
      });

      // create remove button element
      const removeItemBtnElement = new ToDoElement({
        type: 'i',
        classes: ['fa', 'fa-times', 'todo-list--button', 'todo-list--button__remove'],
        parent: itemElement.element
      });
      removeItemBtnElement.addEvent({
        type: 'click',
        callback: () => this.removeItem(removeItemBtnElement.element)
      });
    }
  }

  updateLocalStorage() {
    const items = Array.from(document.querySelectorAll(`#list-${this.key} .todo-list--input-text`)),
          checkboxes = Array.from(document.querySelectorAll(`#list-${this.key} .todo-list--input-check`)),
          title = document.querySelector(`#list-${this.key} .todo-list--title`).value,
          itemValues = [title];
    // push item and completed state to local storage
    items.forEach(( item, i ) => {
      itemValues.push({ value: item.value, done: checkboxes[i].checked } || '')
    });
    localStorage.setItem(`list-${this.key}`, JSON.stringify(itemValues));
  }

  removeItem(button) {
    const item = button.parentNode,
          list = item.parentNode;
    list.removeChild(item);
    this.updateLocalStorage();
  }

  removeErrorClass() {
    this.parentNode.classList.remove('todo-list--item__invalid');
  }

  validateItems() {
    const items = Array.from(document.querySelectorAll(`#list-${this.key} input[type="text"]`));
    let valid = true;
    // iterate over items and add error class if there is no value
    items.forEach(input => {
      if (input.value == '') {
        input.parentNode.classList.add('todo-list--item__invalid');
        valid = false;
      }
    })

    return valid;
  }

  handleCheckbox(element) {
    const parent = element.parentNode,
          text = parent.querySelector('input[type="text"]');
    // add/remove classes based on checkbox value
    if (element.checked) {
      text.classList.add('todo-list--input-text__done');
      parent.classList.add('todo-list--item__done');
    } else {
      text.classList.remove('todo-list--input-text__done');
      parent.classList.remove('todo-list--item__done');
    }

    text.disabled = !text.disabled;
    this.updateLocalStorage();
  }

  toggleCompleted() {
    const list = document.getElementById(`list-${this.key}`);
    // add/remove classes based on toggle value
    if (list.classList.contains('todo-list__clean')) {
      list.classList.remove('todo-list__clean');
      list.querySelector('.todo-list--button__toggle').innerHTML = 'hide completed';
    } else {
      list.classList.add('todo-list__clean');
      list.querySelector('.todo-list--button__toggle').innerHTML = 'show completed';
    }
  }
}

// ---------------------------------------------------------------
// ToDoElement
// Creates a new element from obj config,
// appends to parent element in obj.parent
// ---------------------------------------------------------------
class ToDoElement {
  constructor(obj) {
    // create element
    const element = document.createElement(obj.type);

    // add attributes
    if (obj.attributes) {
      obj.attributes.forEach(item => {
        // only add checked attribute if true
        if (item.attr == 'checked' && item.val == false) {
          return;
        } else {
          element.setAttribute(item.attr, item.val);
        }
      })
    }

    // add classes
    if (obj.classes)
      element.classList.add(...obj.classes);

    // add value
    if (obj.value)
      element.value = obj.value || '';

    // add events
    if (obj.events) {
      obj.events.forEach(item => {
        element.addEventListener(item.type, item.callback);
      })
    }

    // add content
    (obj.content) ? element.innerHTML = obj.content : null;

    // append to parent
    obj.parent.appendChild(element)

    // store the element
    this.element = element;
  }

  // allows us to pass this.element as a callback arg after element is created
  addEvent(obj) {
    this.element.addEventListener(obj.type, obj.callback);
  }
}

// ---------------------------------------------------------------
// Instantiate and run main app here
// ---------------------------------------------------------------
ToDoApp.key = 0;
const todo = new ToDoApp();
