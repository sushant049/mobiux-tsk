let fs = require('fs');
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

exports.DataSet = (req, res) => {
  let object = fs.readFileSync("./app/static/data-set.txt", function (err, data) {
    if (err)
      throw err;
    return data;
  });
  res.status(200).send(JSON.parse(object));
};

exports.AllCalculations = (req, res) => {
  let object = JSON.parse(req.body.data);
  let responseObject = [];
  let payload = [];

  let TotalSale = object.reduce((accumulator, price) => {
    return accumulator + price["Total Price"];
  }, 0);

  months.forEach((month) => {
    let MonthlyFilteredData = object.filter((monthData) => {
      let date = new Date(monthData.Date);
      return (date.getMonth() + 1) === (months.indexOf(month) + 1);
    }).map((data) => {
      return {
        "SKU": data['SKU'],
        "Quantity": data['Quantity'],
        "Sales": data['Total Price']
      };
    });

    // filtering out the individual SKU(s)
    let AllSKU = MonthlyFilteredData.map((data) => {
      return data.SKU
    });

    let FilteredSKU = AllSKU.filter((v, i) => {
      return AllSKU.indexOf(v) === i
    });

    // calculating monthly revenue
    let MonthlyRevenue = MonthlyFilteredData.map((data) => {
      return data.Sales;
    }).reduce((prevValue, currentValue) => {
      return prevValue + currentValue;
    }, 0);

    // analysing the popular item and best seller item
    GetMonthlyPopularItem = () => {
      let FinalFilteredData = [];
      FilteredSKU.forEach((SKU) => {
        let SKUTotalQuantity = MonthlyFilteredData.filter((item) => {
          return item.SKU === SKU;
        });

        FinalFilteredData.push({
          "SKU": SKU,
          "TotalQuantity": SKUTotalQuantity.map((data) => {
            return data.Quantity
          }).reduce((acc, data) => {
            return acc + data
          }, 0)
        });
      });
      return FinalFilteredData.reduce((acc, data) => {
        return (acc.TotalQuantity || 0) > data.TotalQuantity ? acc : data;
      }, {});
    }
    GetMonthlyBestSeller = () => {
      let FinalFilteredData = [];
      FilteredSKU.forEach((SKU) => {
        let SKUTotalSales = MonthlyFilteredData.filter((item) => {
          return item.SKU === SKU;
        });

        FinalFilteredData.push({
          "SKU": SKU,
          "TotalSales": SKUTotalSales.map((data) => {
            return data.Sales;
          }).reduce((acc, data) => {
            return acc + data
          }, 0)
        });
      });
      return FinalFilteredData.reduce((acc, data) => {
        return (acc.TotalSales || 0) > data.TotalSales ? acc : data;
      }, {});
    }

    let MonthlyPopularItem = GetMonthlyPopularItem();
    let MonthlyBestSeller = GetMonthlyBestSeller();

    // getting popular item's min, max and avg number of sales
    let PopularItemData = MonthlyFilteredData.filter((data) => {
        return data.SKU == MonthlyPopularItem.SKU;
      })
      .map((filteredData) => {
        return filteredData.Quantity;
      });

    let PopularTotalQuantity = MonthlyPopularItem.TotalQuantity;

    let PopularAverageQuantity = PopularTotalQuantity / (PopularItemData.length);

    let PopularMinMax = PopularItemData.reduce((previousData, currentData) => {
      previousData[0] = (previousData[0] === undefined || currentData < previousData[0]) ? currentData : previousData[0]
      previousData[1] = (previousData[1] === undefined || currentData > previousData[1]) ? currentData : previousData[1]
      return previousData;
    }, []);
    if (MonthlyRevenue != 0) {
      let MonthlyData = {
        "month": month,
        "Revenue": MonthlyRevenue,
        "Best_Seller": MonthlyBestSeller.SKU,
        "Popular_Item": {
          "SKU": MonthlyPopularItem.SKU,
          "Min_Sale": PopularMinMax[0],
          "Max_Sale": PopularMinMax[1],
          "Avg_Sale": PopularAverageQuantity.toFixed(2)
        }
      }
      payload.push(MonthlyData);
    }
  });

  responseObject.push({
    'Total_Sale': TotalSale
  }, {
    'Data': payload
  });

  res.status(200).send(responseObject);
};