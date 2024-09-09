let currentNumber = 1;
const resultDiv = document.getElementById('result');

function checkNumber(clickedNumber) {
    if (clickedNumber === currentNumber) {
        if (currentNumber === 4) {
            resultDiv.textContent = '恭喜你赢了!';
            currentNumber = 1;
        } else {
            resultDiv.textContent = '正确!继续下一个数字。';
            currentNumber++;
        }
    } else {
        resultDiv.textContent = '错误,请重新开始。';
        currentNumber = 1;
    }
}