import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/user-message.js"

class ChatPage extends LitElement{
    static get styles() {
        return css`
            
        `;
      }
    render(){     
        return html`
            <div id="chat-section">
        
                <form id="message-form">
                    <input 
                        id="message-input"
                        type="text"
                        placeholder="Type here" 
                        autocomplete="off" 
                        required
                    />
                    <button type="submit" id="message-button">Send</button>
                </form>
                
            </div>
        `
    }
}
window.customElements.define('chat-page', ChatPage);