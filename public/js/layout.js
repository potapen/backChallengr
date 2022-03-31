console.log('this is layout.js')


let labelsArray = ['a'];
let datasArray = [1];
const data = {
  labels: labelsArray,
  datasets: [{
    label: 'League Activity',
    data: datasArray,
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};

const config = {
  type: 'line',
  data: data,
};



async function getOneRegister () {
  const response = await axios({ //we need to return a promise
    method: 'GET',
    url: 'http://localhost:3000/challenge'
  })
  console.log('-------------------------------response.data: ', response.data)
  return response.data
};

async function getUsersFromLeague (leagueID) {
  console.log('getUsersFromLeague')
  const response = await axios({ //we need to return a promise
    method: 'GET',
    baseURL: 'http://localhost:3000/boards/leagueobj/',
    url: leagueID,
  });
  const membersObjArray = response.data.members
  return membersObjArray
};

async function getStakeOverTimeFromLeague (leagueID) {
  console.log('getStakeOverTimeFromLeague')
  const response = await axios({ //we need to return a promise
    method: 'GET',
    baseURL: 'http://localhost:3000/boards/leaguestat/',
    url: leagueID,
  });
  const stakesObjArray = response.data
  return stakesObjArray
};

window.addEventListener("DOMContentLoaded", async (event) => { //otherwise the DOM is not loaded and menuButton returns null
    console.log("DOM entièrement chargé et analysé");
    const menuButton = document.querySelector('#menuButton');
    const navTopElt = document.querySelector('#myTopnav');
    const nameSelectElt = document.querySelector('#nameSelect');

    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );

    const menuClick = (event)=>{
        // console.log('click on menu event ', event)
        console.log('navTopElt.className :', navTopElt.className)
        if (navTopElt.className === "topnav") {
            navTopElt.className += " responsive";
          } else {
            navTopElt.className = "topnav";
          }
    }
    menuButton.addEventListener('click', menuClick);




    const data = await getOneRegister();


    const leagueSelectElt = document.querySelector('#leagueSelect');

    const leagueSelectClick = async (event)=>{
      const leagueID = leagueSelectElt.value;
      if(leagueID){
        const stakesObjArray = await getStakeOverTimeFromLeague(leagueID);

        //get data for the graph
        labelsArray = [];
        datasArray = [];
        stakesObjArray.forEach(obj =>{
          labelsArray.push(obj._id);
          datasArray.push(obj.totalStake);
        })
        
        myChart.data.labels = labelsArray;
        myChart.update();
        
        
        myChart.data.datasets.forEach((dataset) => {
          dataset.data = datasArray;
      });
        // console.log('--------------------------myChart.data.datasets.data:', myChart.data.datasets.data);
        myChart.update();

        

        //fill the members in the select
        const membersObjArray = await getUsersFromLeague(leagueID);
        nameSelectElt.innerHTML = "";
        membersObjArray.forEach(obj => {
          const optionElt = document.createElement('option');
          optionElt.value = obj._id;
          optionElt.innerText = obj.username;
          nameSelectElt.appendChild(optionElt);
          }
        )
      }
    }
    leagueSelectElt.addEventListener('click', leagueSelectClick);
  });

