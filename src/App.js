 import React, { useEffect, useState, useMemo } from 'react'
 import Chart from 'react-apexcharts'

const priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
const ohlcUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=30'
async function getOpenHighLowClose() {
  const response = await fetch(ohlcUrl)
  return response.json()
}
async function getPrice() {
  const response = await fetch(priceUrl)
  return response.json()
}

const chart = {
  options: {
    theme: {
      mode: 'dark',
    },
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
        enabled: true,
        theme: 'dark',
      }
    }
  },
}

function App() {
  const [series, setSeries] = useState([{
    data: []
  }])
  const [price, setPrice] = useState(-1)
  const [prevPrice, setPrevPrice] = useState(-1)

  useEffect(() => {
    let timeoutId
    async function getLatestPrice() {
      try {
        const data = await getPrice()
        const ohlc = await getOpenHighLowClose()
        setPrevPrice(price)
        setPrice(data.bitcoin.usd)
        const prices = ohlc.map((timestamp, index) => ({
          x: new Date(ohlc[index][0]),
          y: [ohlc[index][1], ohlc[index][2], ohlc[index][3], ohlc[index][4]],
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
    prevPrice < price ? 'up' : prevPrice > price ? 'down' : ' ',[price, prevPrice])

  const directionEmojies = {
    'up': '📈',
    'down': '📉',
    ' ': ' ',
  }


  return (
    <div className="container">
      <div className="header">
        <div className="ticker">
          BTC
        </div>

        <div className={['price', direction].join(' ')}>
          ${price} {directionEmojies[direction]}
        </div>
      </div>

      <div className="chart">
        <Chart
          options={chart.options}
          series={series}
          type="candlestick"
          width="100%"
          height={450}
        />
      </div>
    </div>
  );
}

export default App;
