import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import Router from "/pageLogics/router.js"

class AppBody extends LitElement{
    static get styles() {
        return css`
            ::slotted(*){
                width: 1124px;
                margin: auto !important;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        `;
      }
    render(){     
        return html`
            <div id="app-body">
                <slot></slot>
            </div>
        `
    }
    firstUpdated(){
       Router.appRoot = this.shadowRoot.getElementById('app-body')
    }
}
window.customElements.define('app-body', AppBody);