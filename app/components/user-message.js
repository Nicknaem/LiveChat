import { LitElement, html } from "https://unpkg.com/lit-element/lit-element.js?module"

class UserMessage extends LitElement{

    render(){       
        // const {userImage, userName} = this; //this way you have to order names respectively
        console.log(this.props);
        return html`
            <style>
                .image{
                    background-image:url(${this.props.image})
                }
            </style>   
            <div class="message">
                <div class="image"></div>
                <div class="name">${this.props.username}</div>
                <div class="text">${this.props.text}</div>
                <div class="date">${this.props.date}</div>
            </div>
        `
    };

    static get properties() {
        return { 
          props: {
              type: Object
          }
        };
    }

    // static get observedAttributes() {
    //     return ["someAttribute"];
    // }

    // attributeChangedCallback(name, oldValue, newValue) {
    //     if (oldValue === newValue) {
    //         return;
    //     }    
    //     console.log(`The attribute ${name} has changed`);
    // }
}
window.customElements.define('user-message', UserMessage);