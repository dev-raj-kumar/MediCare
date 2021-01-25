//Working with search button;

const search = document.querySelector('#search');
const matchList = document.querySelector('#match-list');

let hospitals = '';

getHospital();

async function getHospital(){
    try{
        const response = await axios.get('/allHospitals');
        hospitals = response.data.hospitals;
    }catch(err){
        console.log(err);
        console.log('Error fetching hospital list')
    }
}

//Search the states
const searchStates = (searchText)=>{
    console.log(hospitals);
    const states = JSON.parse(hospitals);

    //Get matches to current input value
    let matches = Object.values(states).filter(state =>{
        const regex =  new RegExp(`^${searchText}`, 'gi');
        return state.name.match(regex);
    });

    if(searchText.length == 0){
        matches = [];
        matchList.innerHTML = '';
    }
    
    let html='';
    matches.forEach((match)=>{
         html += ` <div class="card" onclick="myFunction('${match.name}')">
                         <h4>${match.name}</h4>
                         <form class="form-id" action="/hos" method="POST">
                             <input type="hidden" name="hos" value="${match.name}"
                         </form>    
                       </div> `

    })
    matchList.innerHTML = html;
}
search.addEventListener('input', ()=> searchStates(search.value));

function myFunction(name){
    search.value = name;
}

