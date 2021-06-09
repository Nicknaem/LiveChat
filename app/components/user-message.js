import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import App from '/app.js'

class UserMessage extends LitElement{

    static get styles() {
        return css`
            .self{
                background-color:rgba(0,100,0,0.3);
            }
        `;
    }
            // .image{
            //     /* background-image:url(${this.props.userDetails.image}) */
            // }
    render(){       
        return html`
        <style>

        </style>
            <div class="message ${this.props.userName == App.user ? "self":""}">
                <div class="image"></div>
                <div class="name">${this.props.userName}</div>
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