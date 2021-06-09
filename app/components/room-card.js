import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module"
import App from '/app.js'

class RoomCard extends LitElement{
    static get styles() {
        return css`
        #room-card{
            display:flex;
            flex-direction: column;
            width: 300px;
            border-radius: 20px;
            box-shadow: 1px 1px 5px rgba(0,0,0,0.2);
            padding-bottom: 20px;
        }
        #room-card:hover{
            cursor:pointer;
        }
        .mode, .players{
            text-align:center;
            font-size:2em;
            color: dodgerblue;
            margin-top:20px;
        }
        .players{
            color: limegreen;
        }
        `;
    }

    render(){       
        return html` 
            <div id="room-card">
               <div class="mode"><slot id="mode"></slot></div>
               <div class="players">${this.players} Players</div>
            </div>
        `
    };
    firstUpdated() {

        this.addEventListener('click', (event)=>{
            App.room = this.shadowRoot.getElementById('mode').assignedNodes()[0].data;
            App.navigateTo('/chat');
        })
    }
        

    
    static get properties() {
        return { 
          players: { type: Number }
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
window.customElements.define('room-card', RoomCard);