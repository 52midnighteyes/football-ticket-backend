// class Counter {
//   count = 0;

//   increment = () => {
//     this.count++;
//   };
// }

class Counter {
  count = 0;

  increment() {
    this.count++;
  }
}

const counter = new Counter();
console.log(counter);
counter.increment();
console.log(counter);

const fn = counter.increment;
fn();
console.log(counter);
