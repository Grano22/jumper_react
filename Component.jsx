import React, {Component} from 'react';
import { ActionsStack, ActionOperation, ActionResumeOperation } from './ActionsStack';

/* Jumper - App state control logic */
class AddListItem extends ActionResumeOperation {
    name = "Adding item to list";
    description = "Action adding item to list";

    onStore(component, inputData) {
        component.listItems.push(inputData.contents);   
        return {};
    }

    onResume(component, inputData) {

    }

    onRestore(component, inputData) {
        this.onStore(component, inputData);
    }
}

class DeleteListItem extends ActionResumeOperation {
    name = "Deleting item from list";
    description = "Action removing item from list";

    onStore(component, inputData) {
        
        return {};
    }

    onResume(component, inputData) {

    }

    onRestore(component, inputData) {

    }
}

/* React Component logic */
export default class ExampleComponent extends Component {
  constructor(props) {
      super(props);
      this.exampleList = null;
      this.contentBox = null;
      this.listItems = [];
      this.actions = new ActionsStack(this, [
           AddListItem,
           DeleteListItem
      ], true);
  }
  
  addListItem() {
     this.actions.addOperation(new AddListItem(), { contents:this.contentBox.value });
  }
  
  render() {
    const compList = this.listItems.map(v=>(<li>{v}</li>));
    return (<>
      <input type="text" ref={this.contentBox}/>
      <button onClick={()=>addListItem()}>Add list item</button>
      <ul ref={this.exampleList}>{compList}</ul>
    </>);
  }
}
