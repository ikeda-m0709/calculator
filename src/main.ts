import './style.css'

const display = document.getElementById("display") as HTMLDivElement;

let preNumber: string = "";
let currentNumber: string = "";
let operate: string = "";
let result: number | string;
let temporaryNumber: string = "";
let isError: boolean = false;


//Cボタンの挙動
const clear = document.getElementById("clear") as HTMLButtonElement;
clear.addEventListener("click", () => {
    preNumber = "";
    currentNumber = "";
    operate = "";
    result = 0;
    temporaryNumber = "";
    isError = false;
    display.textContent = "0";
})

//計算用の関数
function calculate(operate: string, preNumber: string, currentNumber: string) {
    //全角－を半角-に変換する（計算結果NaNを防ぐ）
    if(preNumber.includes("−")) preNumber = preNumber.replace("−", "-");
    if(currentNumber.includes("−")) currentNumber = currentNumber.replace("−", "-");
    switch(operate) {
        case "+": result = parseFloat(preNumber) + parseFloat(currentNumber);
        break;
        
        case "−": result = parseFloat(preNumber) - parseFloat(currentNumber);
        break;
        
        case "×": result = parseFloat(preNumber) * parseFloat(currentNumber);
        break;
        
        case "÷": result = parseFloat(preNumber) / parseFloat(currentNumber);
        break;
    }
    
   //計算時の誤差の時は丸め、誤差でなく8文字を超える場合のみ、計算結果を指数表記に変換
   const roundedResult = Math.round(Number(result) * 1e12) / 1e12;
   if(String(roundedResult).length > 9) {
        result = Number(result).toExponential(3);
    } else {
        result = roundedResult;
    }
}

//数字ボタンの挙動
const nums = document.querySelectorAll(".num");

nums.forEach((num) => {
    const numValue = num.textContent;//数次ボタンの値
    num.addEventListener("click", () => {
         //「エラー」表示中の入力無効
        if(isError) {
            console.log("エラー内容：入力は無効です。Cボタンを押してください")
            return;
        } 
        //if(currentNumber === "" && numValue === ".") return;
        //7/13 最初に「.」を押下で「0.」になるように修正
        if(currentNumber === "" && numValue === ".") {
            currentNumber = "0.";
            display.textContent = currentNumber;
        }
        if(currentNumber.includes(".") && numValue === "." ) return;
        if(currentNumber === "0" && numValue !== ".") {
            currentNumber = "";
            }
            if(currentNumber.length < 8 || (currentNumber.includes(".") && currentNumber.length < 9)) {
                if(temporaryNumber !=="") {
                    currentNumber = temporaryNumber;
                    temporaryNumber ="";
                }
                //－の後にも01のような入力を防ぐ
                if (currentNumber === "−0" && numValue !== ".") {
                    currentNumber = "−";
                }
                currentNumber += numValue;
                if(preNumber !== "") {
                    display.textContent = preNumber + operate + currentNumber;
                } else {
                    display.textContent = currentNumber;
                }
            }
        }
    );
});

//演算子ボタンの挙動
const calcs = document.querySelectorAll(".calc");

calcs.forEach(calc => {
    calc.addEventListener("click", ()=> {
         //「エラー」表示中の入力無効
        if(isError) {
            console.log("エラー内容：入力は無効です。Cボタンを押してください")
            return;
        } 
        if((preNumber === "" && currentNumber === "") && calc.textContent === "−") {
            temporaryNumber = "−";
            display.textContent = temporaryNumber;
            return;
        }
        //7/13 最初に－以外の演算子を押下すると「0+」のようにpreNumberが0とする表示に修正
        //if((preNumber === "" && currentNumber === "") && calc.textContent !== "−") return;
        if((preNumber === "" && currentNumber === "") && calc.textContent !== "−") {
            preNumber = "0";
            operate = String(calc.textContent);
        }
        //7/13 0.+などの入力をした際に、演算子が無効になる処理
        if(currentNumber.slice(-1) === "." ) return;
        if(preNumber === "") {
            preNumber = currentNumber;
            currentNumber = "";
            if(calc.textContent !== null) {
                operate = calc.textContent;
            }
            display.textContent = preNumber + operate;
        } else {
            if(currentNumber !== "") {
                if (operate === "÷" && currentNumber === "0") {
                    display.textContent = "エラー";
                    console.log("エラー内容：0除算されました");
                    preNumber = "";
                    currentNumber = "";
                    operate = "";
                    result = 0;
                    isError = true;
                    return;
                }
                calculate(operate, preNumber, currentNumber);
                display.textContent = String(result) + operate;
                preNumber = String(result);
                currentNumber = "";
            }
            if(calc.textContent !== null) {
                operate = calc.textContent;
            }
            display.textContent = preNumber + operate;
        }
    })
})

//＝ボタンの挙動
const equal = document.getElementById("equal") as HTMLButtonElement;

equal.addEventListener("click", () => {
    //「エラー」表示中の入力無効
    if(isError) {
        console.log("エラー内容：入力は無効です。Cボタンを押してください")
        return;
    } 
    //数値を入力し、記号を入力する前に=ボタンが押下された場合は**数値を維持して計算しない**
    if(operate === "") return;
    if(currentNumber !== "") {
        calculate(operate, preNumber, currentNumber);
        if(currentNumber === "0" && operate === "÷") {
            display.textContent = "エラー";
            console.log("エラー内容：0除算されました");
            preNumber = "";
            currentNumber = "";
            operate = "";
            result = 0;
            isError = true;
        } else {
            display.textContent = String(result);
            preNumber = String(result);
            currentNumber = "";
        }
    }
})