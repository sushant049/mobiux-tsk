let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDataSet() {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(xhttp.responseText);
      }
    };
    xhttp.open("GET", "/GetDataSet", true);
    xhttp.send();
  });
}

function getAllCalculations(obj) {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(xhttp.responseText);
      }
    };
    xhttp.open("POST", "/AllCalculations", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({
      data: obj
    }));
  });
}

getDataSet()
  .then((object) => {
    getAllCalculations(object).then((response) => {
      let data = JSON.parse(response);
      document.getElementById('total-revenue').innerText = "Rs." + data[0].Total_Sale.toLocaleString("en-IN");
      data[1].Data.forEach((item)=>{
        let container = document.getElementById("monthlyContainer");
        let child = `<div class='child-container'>
        <h3>Rs. ${item.Revenue.toLocaleString('en-IN')}</h3>
        <h5>${item.month}</h5>
        <p>Best seller : ${item.Best_Seller}</p>
        <p>Popular Item : ${item.Popular_Item.SKU}
          <ul type='disc'>
            <li>Min Sale : ${item.Popular_Item.Min_Sale}</li>
            <li>Max Sale : ${item.Popular_Item.Max_Sale}</li>
            <li>Avg Sale : ${item.Popular_Item.Avg_Sale}</li>
          </ul>
        </p>
        </div>`;
        container.innerHTML += child;
      });
    })
    .catch((err)=>{
      console.log(err.message);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });