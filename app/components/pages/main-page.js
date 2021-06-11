import { LitElement, html, css} from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/room-card.js"
import App from "/app.js"

class MainPage extends LitElement{
    static get styles() {
        return css`
            #chat-page{
                width: 1124px;
                margin:auto;   
            }

            #room-section, #user-section{
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                width: 100%;
            }

            #user-info{
                display:flex;
                flex-direction:column;
                align-items:center;
            }
                #user-image{
                    margin-top: 100px;
                    height: 170px;
                    width: 170px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;

                    background-color: linear-gradient(145deg, #cacaca, #f0f0f0);
                    box-shadow:  6px 6px 12px #bebebe,-6px -6px 12px #ffffff;
                }
                #user-input{
                    margin-top: 40px;
                    border: none;
                    outline: none;
                    border-radius:50px;
                    font-size: 1.5em;
                    padding: 10px 15px;
                    background-color:transparent;
                    box-shadow: 7px 7px 25px #bebebe,
                                -7px -7px 35px rgba(255, 255, 255, .7),
                                rgb(240 240 240) 0px 0px 2px 4px inset,
                                rgb(190 190 190) 5px 5px 8px inset; 

                    transition: all 0.3s ease-out;
                }
                #user-input::placeholder{
                    color: rgba(0,0,0,0.3);
                }
                a{
                    text-decoration: none;
                }
                .light{
                    transform:scale(1.08);
                }
        `
    }
    
    render(){       
        return html`
        <div id="chat-page">
            <div id="user-section">
                <div id="leaderboard">
                    
                </div>
                <div id="user-info">
                    <div id="user-image" style='background-image:url("/Assets/Snakes/snake1.png")'></div>
                    <input id="user-input" class="${this.animating?"light":""}" type="text" placeholder="Enter your name" value="${App.userName?App.userName:""}" required> <!--@@-->
                </div>
                <div id="stats">

                </div>
            </div>
            <div id="room-section">
                <room-card>Time Mode</room-card>
                <room-card>Hit Mode</room-card>
                <room-card>Eat Mode</room-card>
            </div>
        </div>
        `
    }
    static get properties() {
        return { 
          animating: { type: Boolean }
        };
    }

    firstUpdated() {
        this.animating = false;
        this.userInput = this.shadowRoot.getElementById('user-input');

        this.userInput.addEventListener('input',(event)=>{
            App.userName = event.target.value;
            //debounce and check if user name is available in users collection
            //if yes show "OK"-create user icon to create new account
            //esle show login icon
        }) 

        this.addEventListener('no-name',()=>{
            this.animating = !this.animating;
        })
    }

}
window.customElements.define('main-page', MainPage);



