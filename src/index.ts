import './styles/index.scss';
import { Chart, ChartPoint } from 'chart.js';
import * as tf from '@tensorflow/tfjs';

const MAX_X = 500;
const MAX_Y = 500;
const linearR = {
  optimizer: tf.train.sgd(0.5),
  epochs: 50,
  x_vals: [] as number[],
  y_vals: [] as number[],
  // TODO: get a random number between -1 and 1
  m: tf.variable(tf.scalar(Math.random())),
  b: tf.variable(tf.scalar(Math.random())),
  loss: (pred: tf.Tensor<tf.Rank>, labels: tf.Tensor1D) =>
    pred.sub(labels).square().mean(),
  predict: (x: number[]) => {
    const xs = tf.tensor1d(x);
    // y = mx + b;
    const ys = xs.mul(linearR.m).add(linearR.b);
    return ys;
  },
  draw: (valueX: number, valueY: number) => {
    let x = valueX / MAX_X;
    let y = valueY / MAX_Y;
    linearR.x_vals.push(x);
    linearR.y_vals.push(y);

    tf.tidy(() => {
      if (linearR.x_vals.length > 0) {
        const ys = tf.tensor1d(linearR.y_vals);
        for (let i = 0; i < linearR.epochs; i++) {
          linearR.optimizer.minimize(() =>
            linearR.loss(linearR.predict(linearR.x_vals), ys)
          );
        }
      }
    });

    const lineX = [-1, 1];
    const ys = tf.tidy(() => linearR.predict(lineX));
    // TODO: use .data() => Promise
    let lineY = ys.dataSync();
    ys.dispose();
    let dataset = chart.data.datasets?.[0];
    if (dataset) {
      dataset.data = [];
      lineX.forEach((x, i) => {
        dataset?.data?.push({
          x: x * MAX_X,
          y: lineY[i] * MAX_Y
        } as number & ChartPoint);
      });
    }
    chart.update();
  }
};

const polynomialR = {
  optimizer: tf.train.adam(0.2),
  epochs: 100,
  x_vals: [] as number[],
  y_vals: [] as number[],
  // TODO: get a random number between -1 and 1
  a: tf.variable(tf.scalar(Math.random())),
  b: tf.variable(tf.scalar(Math.random())),
  c: tf.variable(tf.scalar(Math.random())),
  d: tf.variable(tf.scalar(Math.random())),
  loss: (pred: tf.Tensor<tf.Rank>, labels: tf.Tensor1D) =>
    pred.sub(labels).square().mean(),
  predict: (x: number[]) => {
    const xs = tf.tensor1d(x);
    // y = ax^3 + bx^2 + cx + d
    const ys = xs
      .pow(tf.scalar(3))
      .mul(polynomialR.a)
      .add(xs.square().mul(polynomialR.b))
      .add(xs.mul(polynomialR.c))
      .add(polynomialR.d);
    return ys;
  },
  draw: (valueX: number, valueY: number) => {
    let x = valueX / MAX_X;
    let y = valueY / MAX_Y;
    polynomialR.x_vals.push(x);
    polynomialR.y_vals.push(y);

    tf.tidy(() => {
      if (polynomialR.x_vals.length > 0) {
        const ys = tf.tensor1d(polynomialR.y_vals);
        for (let i = 0; i < polynomialR.epochs; i++) {
          polynomialR.optimizer.minimize(() =>
            polynomialR.loss(polynomialR.predict(polynomialR.x_vals), ys)
          );
        }
      }
    });

    const curveX: number[] = [];
    for (let i = -1; i < 1; i += 0.02) {
      curveX.push(i);
    }
    const ys = tf.tidy(() => polynomialR.predict(curveX));
    // TODO: use .data() => Promise
    let curveY = ys.dataSync();
    ys.dispose();
    let dataset = chart.data.datasets?.[1];
    if (dataset) {
      dataset.data = [];
      curveX.forEach((x, i) => {
        dataset?.data?.push({
          x: x * MAX_X,
          y: curveY[i] * MAX_Y
        } as number & ChartPoint);
      });
    }
    chart.update();
  }
};

const cvs = (document.getElementById('chart') as HTMLCanvasElement).getContext(
  '2d'
) as CanvasRenderingContext2D;

const chart = new Chart(cvs, {
  type: 'scatter',
  data: {
    datasets: [
      {
        data: [],
        backgroundColor: 'transparent',
        pointBorderColor: 'transparent',
        pointBackgroundColor: 'transparent',
        borderColor: 'blue',
        type: 'line',
        label: 'Linear'
      },
      {
        data: [],
        backgroundColor: 'transparent',
        pointBorderColor: 'transparent',
        pointBackgroundColor: 'transparent',
        borderColor: 'red',
        type: 'line',
        label: 'Polynomial'
      },
      {
        data: [],
        pointBorderColor: '#000',
        pointBackgroundColor: '#000',
        type: 'scatter',
        label: 'Data'
      }
    ]
  },
  options: {
    onClick: (element) => {
      let scaleRef,
        valueX = 0,
        valueY = 0;
      for (let scaleKey in chart.scales) {
        if (chart.scales.hasOwnProperty(scaleKey)) {
          scaleRef = chart.scales[scaleKey];
          if (scaleRef.isHorizontal() && scaleKey === 'x-axis-1') {
            valueX = scaleRef.getValueForPixel(element?.offsetX) as number;
          } else if (scaleKey === 'y-axis-1') {
            valueY = scaleRef.getValueForPixel(element?.offsetY) as number;
          }
        }
      }
      const scatterData = chart.data.datasets?.find(
        (x) => x.type === 'scatter'
      );

      scatterData?.data?.push({
        x: valueX,
        y: valueY
      } as number & ChartPoint);

      linearR.draw(valueX, valueY);
      polynomialR.draw(valueX, valueY);
    },
    scales: {
      yAxes: [
        {
          ticks: {
            min: -(MAX_Y / 2),
            max: MAX_Y / 2
          }
        }
      ],
      xAxes: [
        {
          ticks: {
            min: -(MAX_X / 2),
            max: MAX_X / 2
          }
        }
      ]
    },
    tooltips: {
      enabled: false
    },
    legend: {
      display: true
    },
    elements: {
      line: {
        tension: 0 // disables bezier curves
      }
    }
  }
});
