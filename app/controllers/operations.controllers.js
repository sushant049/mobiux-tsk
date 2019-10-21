let fs = require('fs');
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

exports.DataSet = (req, res) => {
  let object = fs.readFileSync("./app/static/data-set.txt", function (err, data) {
    if (err)
      throw err;
    return data;
  });
  res.send(JSON.parse(object));
};

exports.AllCalculations = (req, res) => {
  let object = JSON.parse(req.body.data);

  let responseObject = [];

  let payload = [];

  let totalSale = object.reduce((accumulator, price) => {
    return accumulator + price["Total Price"];
  }, 0);

  months.forEach((month) => {
    let monthlyRevenue = object.filter((monthData) => {
        let date = new Date(monthData.Date);
        return (date.getMonth() + 1) == months.indexOf(month) + 1;
      })
      .map((filteredData) => {
        return filteredData["Total Price"];
      })
      .reduce((acc, data) => {
        return acc + data;
      }, 0);

    let popularItem = object.filter((monthData) => {
        let date = new Date(monthData.Date);
        return (date.getMonth() + 1) == months.indexOf(month) + 1;
      })
      .reduce((acc, data) => {
        return (acc.Quantity) > data.Quantity ? acc : data;
      }, {});

    let bestSeller = object.filter((monthData) => {
        let date = new Date(monthData.Date);
        return (date.getMonth() + 1) == months.indexOf(month) + 1;
      })
      .reduce((acc, data) => {
        return (acc["Total Price"]) > data["Total Price"] ? acc : data;
      }, {});

    // getting popular item's min, max and avg number of sales
    let popularItemData = object.filter((data) => {
        let date = new Date(data.Date);
        return data.SKU == popularItem.SKU && (date.getMonth() + 1) == months.indexOf(month) + 1;
      })
      .map((filteredData) => {
        return filteredData.Quantity;
      });

    let popularTotalQuantity = popularItemData.reduce((acc, data) => {
      return acc + data
    }, 0);

    let popularAverageQuantity = popularTotalQuantity / (popularItemData.length);

    let popularMinMax = popularItemData.reduce((previousData, currentData) => {
      previousData[0] = (previousData[0] === undefined || currentData < previousData[0]) ? currentData : previousData[0]
      previousData[1] = (previousData[1] === undefined || currentData > previousData[1]) ? currentData : previousData[1]
      return previousData;
    }, []);
    if (monthlyRevenue != 0) {
      let monthlyData = {
        "month": month,
        "Revenue": monthlyRevenue,
        "Best_Seller": bestSeller.SKU,
        "Popular_Item": {
          "SKU": popularItem.SKU,
          "Min_Sale": popularMinMax[0],
          "Max_Sale": popularMinMax[1],
          "Avg_Sale": popularAverageQuantity.toFixed(2)
        }
      }
      payload.push(monthlyData);
    }
  });

  responseObject.push({
    'Total_Sale': totalSale,
    'Data': payload
  });
  
  res.status(200).send(responseObject);
};