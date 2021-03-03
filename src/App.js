 import React, { useEffect, useState, useMemo } from 'react'
 import Chart from 'react-apexcharts'

const proxyUrl = 'http://cors-anywere.herokuapp.com/'
const stockUrl = `https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?region=US&lang=en-US&includePrePost=false&interval=1mo&range=max&corsDomain=uk.search.yahoo.com`
async function getStocks() {
  const response = await fetch(stockUrl)
  return response.json()
}

const chart = {
  options: {
    chart: {
      type: 'candlestick',
      height: 350
    },
    title: {
      text: 'Bitcoin Chart',
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      }
    }
  },
}

const round = (number) => {
  return number ? +(number.toFixed(2)) : null
}

function App() {
  const [series, setSeries] = useState([{
    data: []
  }])
  const [price, setPrice] = useState(-1)
  const [prevPrice, setPrevPrice] = useState(-1)
  const [priceTime, setPriceTime] = useState(null)

  useEffect(() => {
    let timeoutId
    async function getLatestPrice() {
      try {
        const data = await getStocks()
        const btc = data.chart.result[0]
        setPrevPrice(price)
        setPrice(btc.meta.regularMarketPrice.toFixed(2))
        setPriceTime(new Date(btc.meta.regularMarketTime * 1000))
        const quote = btc.indicators.quote[0]
        const prices = btc.timestamp.map((timestamp, index) => ({
          x: new Date(timestamp * 1000),
          y: [quote.open[index], quote.high[index], quote.low[index], quote.close[index]].map(round)
        }))
        setSeries([{
          data: prices,
        }])
      } catch (error) {
        console.log(error)
      }
      timeoutId = setTimeout(getLatestPrice, 10000)
    }
    
    getLatestPrice()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [price])

  const direction = useMemo(() =>
    prevPrice < price ? 'up' : prevPrice > price ? 'down' : '',[price, prevPrice])

  const directionEmojies = {
    'up': '📈',
    'down': '📉',
    '': '',
  }


  return (
    <div className="container">
      <div className="ticker">
        BTC
      </div>

      <div className={['price', direction].join(' ')}>
        ${price} {directionEmojies[direction]}
      </div>

      <div className="price-time">
        {priceTime && priceTime.toLocaleTimeString()}
      </div>

      <Chart
        options={chart.options}
        series={series}
        type="candlestick"
        width="100%"
        height={320}
      />
    </div>
  );
}

export default App;
