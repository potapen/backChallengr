console.log("this is graph.js");
let GlobalLeagueID; //leagueID is a variable set in leagueSelectClick callback of an event listener. I use GlobalLeagueID to make leagueID persist out of the function

//Parameters for the line chart
let lineLabelsArray = [];
let lineDatasArrayLine = [];
const lineData = {
  labels: lineLabelsArray,
  datasets: [
    {
      label: "League Activity",
      data: lineDatasArrayLine,
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};
const lineConfig = {
  type: "line",
  data: lineData,
  options: {},
};

//Parameters for the web chart
let webLabelsArray = [];
let webDatasArrayLine = [];
const webData = {
  labels: webLabelsArray,
  datasets: [
    {
      label: "Total score per game",
      data: webDatasArrayLine,
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};
const webConfig = {
  type: "radar",
  data: webData,
  options: {
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  },
};

async function getUsersFromLeague(leagueID) {
  const response = await axios({
    //we need to return a promise
    method: "GET",
    baseURL: "http://localhost:3000/graphs/leagueobj/",
    url: leagueID,
  });
  const membersObjArray = response.data.members;
  return membersObjArray;

  /*
  Array(3) [ {…}, {…}, {…} ]
0: Object { _id: "6242e8b08c623fa3f3698e0d", email: "alexandre@gmail.com", username: "alexandre", … }
1: Object { _id: "6242e8b08c623fa3f3698e0e", email: "ahn@gmail.com", username: "ahn", … }
2: Object { _id: "6242e8b08c623fa3f3698e0f", email: "brian@gmail.com", username: "brian", … }
  */
}

async function getStakeOverTimeFromLeague(leagueID) {
  const response = await axios({
    //we need to return a promise
    method: "GET",
    baseURL: "http://localhost:3000/graphs/leaguestat/",
    url: leagueID,
  });
  const stakesObjArray = response.data;
  return stakesObjArray;

  /*
  Array [ {…}, {…} ]
0: Object { _id: "2022-03-29T11:08:32.559Z", totalStake: 40 }
1: Object { _id: "2022-03-29T11:08:32.561Z", totalStake: 42 }
  */
}

async function getStakePerGameForAGivenUserAndLeague(leagueID, userID) {
  const response = await axios({
    //we need to return a promise
    method: "GET",
    baseURL: "http://localhost:3000/graphs/userstat/",
    url: `${leagueID}/${userID}`,
  });
  const stakePerGameObjArray = response.data;
  return stakePerGameObjArray;

  /*
Array(4) [ {…}, {…}, {…}, {…} ]
0: Object { _id: "6242e8b08c623fa3f3698e18", name: "Beer pong", description: "Le jeu du beerpong, classique", … }
1: Object { _id: "6242e8b08c623fa3f3698e19", name: "Torse pong", description: "Utilise ton torse pour mettre la balle dans le gobelet", … }
2: Object { _id: "62440fe93d1b6330adc5bfee", name: "monjeu", description: "mon is cool", … }
3: Object { _id: "62457e9d2d1567317d6dd3a7", name: "stupidgame", description: "very stupid", … }
__v: 0
_id: "62457e9d2d1567317d6dd3a7"
createdAt: "2022-03-31T10:12:45.452Z"
description: "very stupid"
emoji: ":("
isPrivate: false
name: "stupidgame"
ownerLeagues: Array [ "6242e8b08c623fa3f3698e13" ]
totalGame: 1
totalStake: 20
updatedAt: "2022-03-31T10:12:45.452Z"
 */
}

window.addEventListener("DOMContentLoaded", async (event) => {
  //otherwise the DOM is not loaded and menuButton returns null
  const nameSelectElt = document.querySelector("#nameSelect");
  if (nameSelectElt) {
    //we draw empty chart first
    const lineChart = new Chart(
      document.getElementById("lineChart"),
      lineConfig
    );
    const webChart = new Chart(document.getElementById("webChart"), webConfig);

    const leagueSelectElt = document.querySelector("#leagueSelect");

    /*
    When we click on the dropdown selector of league, we fill the line chart with data from the league
    */
    const leagueSelectClick = async (event) => {
      console.log("inside leagueSelectClick")
      const leagueID = leagueSelectElt.value;
      if (leagueID) {
        //make a check otherwise the below code will try to run in other views
        GlobalLeagueID = leagueID;
        //get data for the graph
        const stakesObjArray = await getStakeOverTimeFromLeague(leagueID);

        //empty data from previous graphs
        lineLabelsArray = [];
        lineDatasArrayLine = [];

        //populate graph with updated data
        stakesObjArray.forEach((obj) => {
          lineLabelsArray.push(obj._id);
          lineDatasArrayLine.push(obj.totalStake);
        });

        lineChart.data.labels = lineLabelsArray;
        lineChart.data.datasets.forEach((dataset) => {
          dataset.data = lineDatasArrayLine;
        });
        //update the chart
        lineChart.update();

        //fill the members in the name drop down
        const membersObjArray = await getUsersFromLeague(leagueID);
        nameSelectElt.innerHTML = "";
        membersObjArray.forEach((obj) => {
          const optionElt = document.createElement("option");
          optionElt.value = obj._id;
          optionElt.innerText = obj.username;
          nameSelectElt.appendChild(optionElt);
        });
      } else {
        GlobalLeagueID = "";
      }
    };

    /*
    When we click on the dropdown selector of user, we fill the web chart with data from the user
    */
    const nameSelectClick = async (event) => {
      const userID = nameSelectElt.value;
      if (userID) {
        const stakePerGameObjArray =
          await getStakePerGameForAGivenUserAndLeague(GlobalLeagueID, userID);
        webLabelsArray = [];
        webDatasArrayLine = [];
        stakePerGameObjArray.forEach((obj) => {
          webLabelsArray.push(obj.name);
          webDatasArrayLine.push(obj.totalStake);
        });

        webChart.data.labels = webLabelsArray;
        webChart.data.datasets.forEach((dataset) => {
          dataset.data = webDatasArrayLine;
        });
        webChart.update();
      }
    };
    leagueSelectElt.addEventListener("click", leagueSelectClick);
    nameSelectElt.addEventListener("click", nameSelectClick);
  }
});
