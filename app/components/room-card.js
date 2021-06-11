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

            transition: all 0.4s ease-in-out;
        }
        #room-card:hover{
            cursor:pointer;
            transform:scale(1.02);
            box-shadow: 2px 2px 12px rgba(0,0,0,0.15);
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
               <div class="players">${this.playersCount} Players</div>
            </div>
        `
    };

    firstUpdated() {
        let roomName = this.shadowRoot.getElementById('mode').assignedNodes()[0].data; //@@
        this.playersCount = 0;
        let animating = false;
        let eventNoName = new CustomEvent('no-name', {
            // detail: { }
            bubbles: true, 
            composed: true
        });

        const socket = App.socket;

        socket.emit('playersCount',roomName)
        socket.on('playersCount',({room,count})=>{
            // console.log('gotdata',room,count,"cardName:",roomName);
            if(room === roomName){
                this.playersCount = count;
            }
        })

        this.addEventListener('click', (event)=>{
            App.room = roomName
            if(App.userName){
                App.navigateTo('/chat');
            }else{
                //highlight "please enter your name" //firing custom event to inform parent component 
                if(!animating){
                    this.dispatchEvent(eventNoName);
                    setTimeout(() => {
                        this.dispatchEvent(eventNoName);    
                        animating = false
                    }, 500);
                }
            }
        })
    }

    static get properties() {
        return { 
          playersCount: { type: Number }
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