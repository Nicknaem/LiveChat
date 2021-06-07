export default class App{
    static socket;
    static appRoot;
    static user;
    static room;
    static loginStatus = true;

    static routes = [
        { path:"/", page: "<main-page></main-page>"},
        { path:"/chat", page: "<chat-page></chat-page>" },
        { path:"/leaderboard", page: "<leaderboard-page></leaderboard-page>"}
    ]
    static updateRoute = ()=>{
        let matchingPage;
        this.routes.forEach((pageRoute)=>{
            if(pageRoute.path === location.pathname){
                matchingPage = pageRoute;
            }
        })
        if(!matchingPage){
            matchingPage = routes[0];
            history.pushState(null,null,"/");
        }

        this.loadPage(matchingPage.page);
    } 

    static navigateTo = (url)=>{
        history.pushState(null,null,url);
        this.updateRoute();
    }

    static loadPage(page){
        this.appRoot.innerHTML = page;
    }
}
App.socket = io();
App.appRoot = document.getElementById('app-root');


//go back loac correct page
window.addEventListener('popstate',App.updateRoute);
//on connect load correct page 
document.addEventListener('DOMContentLoaded',()=>{
    App.updateRoute();
})



