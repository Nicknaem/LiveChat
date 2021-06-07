import { LitElement, html, css} from "https://unpkg.com/lit-element/lit-element.js?module"
import "/components/room-card.js"
import App from "/app.js"

class MainPage extends LitElement{
    static get styles() {
        return css`
            #room-container{
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
            #user-image{
                margin-top: 100px;
                height: 170px;
                width: 170px;
                border-radius: 50%;
                background-color:rgb(189, 236, 189);
                box-shadow: 1px 1px 7px 0px rgb(0 0 0 / 30%)
            }
            #user-input{
                margin-top: 50px;
                border: none;
                outline: none;
                box-shadow: 1px 1px 5px rgba(0,0,0,0.2);
                border-radius:50px;
                font-size: 1.5em;
                padding: 10px 15px;
            }
            #user-input::placeholder{
                color: rgba(0,0,0,0.3);
            }
            a{
                text-decoration: none;
            }
        `
      }
    render(){       
        return html`
            <div id="user-image"></div>
            <input id="user-input" type="text" placeholder="Enter your name">
            <div id="room-container">
                <a href="/chat" name="route-link" >
                    <room-card>Time Mode</room-card>
                </a>
                <a href="/chat" name="route-link" >
                    <room-card>Hit Mode</room-card>
                </a>
                <a href="/chat" name="route-link" >
                    <room-card>Eat Mode</room-card>
                </a>
            </div>
        `
    }

    firstUpdated() {
        this.userInput = this.shadowRoot.getElementById('user-input');
        
        this.shadowRoot.querySelectorAll("[name='route-link']").forEach(element=>{
            // console.log(element);
            element.addEventListener('click',(event)=>{
                    event.preventDefault();
                    // console.log(event.currentTarget)
                    App.room = "TimeMode"; //$$!
                    App.navigateTo(event.currentTarget.href)
                }
            )
        })

        this.userInput.addEventListener('input',(event)=>{
            console.log('changed username',event.target.value);
            App.user = event.target.value;
            //debounce and check if user name is available in users collection
            //if yes show "OK" create user icon
            //esle login icon
        }) 

        //creating account
        /* 
            on OK, post {userName, pin}, and insert it to database users collection
            and => login
            else please login or create account
        */
    }

}
window.customElements.define('main-page', MainPage);



