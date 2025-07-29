import './style.css'

//各ボタン、要素の取得
const display = document.getElementById("display") as HTMLDivElement;
const clearBtn = document.getElementById("clear") as HTMLButtonElement;
const equalBtn = document.getElementById("equal") as HTMLButtonElement;
const nums = document.querySelectorAll(".num") as NodeListOf<HTMLButtonElement>;
const operators = document.querySelectorAll(".operator") as NodeListOf<HTMLButtonElement>;;

//処理ごとのフェーズ管理
type Phase = "initial" | "input" | "operator" | "result";

//状態のstate化
type State = {
  phase: Phase;
  preValue: string;
  currentValue: string;
  operate: string;
  resultNum: number;
  resultStr: string;
  displayStr: string;
  isError: boolean;
};

const state: State = {
  phase: "initial",
  preValue: "0",
  currentValue: "0",
  operate: "",
  resultNum: 0,
  resultStr: "",
  displayStr: "0",
  isError: false,
};

//関数の切り出し
 //ディスプレイ表示の更新
 function updateDisplay(text: string) {
  display.textContent = text;
}

 //◎符号・小数点を除いた桁数を返す関数
function getEffectiveLength(numStr: string): number {
  return numStr.replace(/[−\-\.]/g, "").length;
}

 //◎計算用の関数
function calculate() {
    switch(state.operate) {
        case "+": state.resultNum = parseFloat(state.preValue) + parseFloat(state.currentValue);
        break;
        
        case "-": state.resultNum = parseFloat(state.preValue) - parseFloat(state.currentValue);
        break;
        
        case "×": state.resultNum = parseFloat(state.preValue) * parseFloat(state.currentValue);
        break;
        
        case "÷": if(state.currentValue ==="0") {
            state.isError = true;
        } else {
            state.resultNum = parseFloat(state.preValue) / parseFloat(state.currentValue)
        }
        break;
    }

    //指数表記について
    state.resultStr = String(state.resultNum);
    if(getEffectiveLength(state.resultStr) > 8 ) {
        state.resultStr = state.resultNum.toExponential(3);
    }
}


//数字ボタン押下時の挙動 
nums.forEach((num) => {
    const numValue = num.getAttribute("data-num"); //!は非nullアサーション
    num.addEventListener("click", () => {
        //0除算時のエラー処理
        if(state.isError) {
            console.log("エラー内容：入力は無効です。Cボタンを押してください")
            return;
        } 
        //フェーズごとの挙動
         switch (state.phase) {
            case "initial":
                    //小数点の時以外は先頭が0になるのを避ける
                    if(state.currentValue ==="0" && numValue !== ".") {
                        state.currentValue = numValue!;
                    } else {
                        state.currentValue += numValue;
                    }
                    state.displayStr = state.currentValue;
                    updateDisplay(state.displayStr);
                    state.phase = "input";
            break;

            case "input":
                if(getEffectiveLength(state.currentValue) < 8) {
                //小数点の入力を一度までに制限
                if(state.currentValue.includes(".") && numValue === ".") return;
                //initialの入力が符号－の場合、「-.」のような入力を防ぐ
                if(state.currentValue === "-" && numValue === ".") return;
                //initialの入力が符号－の場合、「-00」のような入力を防ぐ 
                if(state.currentValue === "-0" && numValue === "0") return;
                //小数点以外の入力で、0が先頭になるのを防ぐ
                if(state.currentValue ==="0" && numValue !== ".") {
                    state.currentValue = numValue!;
                } else {
                    state.currentValue += numValue;
                }

                //一回目の入力か、二回目の入力かで表示が分岐
                if(state.operate !== "") {
                    state.displayStr = state.preValue + state.operate + state.currentValue;
                    updateDisplay(state.displayStr);
                } else {
                    state.displayStr = state.currentValue;
                    updateDisplay(state.displayStr);
                }
            }
            break;

            case "operator":
                state.preValue = state.currentValue;
                if(numValue === ".") return;
                state.currentValue = numValue!;
                state.displayStr = state.preValue + state.operate + state.currentValue;
                updateDisplay(state.displayStr);
                state.phase ="input";
            break;

            case "result":
                //小数点の時以外は先頭が0になるのを避ける
                if(state.currentValue ==="0" && numValue !== ".") {
                    state.currentValue = numValue!;
                } else {
                    state.currentValue += numValue;
                }
                state.displayStr = state.currentValue;
                updateDisplay(state.displayStr);
                state.phase = "input";

            break;
         }

    })
})


//演算子ボタン押下時の挙動
operators.forEach((operator) => {
    const operatorValue = operator.getAttribute("data-operator"); 
    operator.addEventListener("click", ()=> {
        //0除算時のエラー処理
        if(state.isError) {
            console.log("エラー内容：入力は無効です。Cボタンを押してください")
            return;
        } 
        //0.+のような入力を避ける
        if (state.displayStr.endsWith(".")) {
            console.log("エラー：小数点の直後に演算子は使用できません。");
            return;
        }

         switch (state.phase) {
            case "initial":
                if(operatorValue !== "-") {
                state.preValue = state.currentValue;
                state.operate = operatorValue!;
                state.displayStr = state.preValue + state.operate;
                state.phase = "operator";
                } else {
                    state.currentValue = "-";
                    state.displayStr = state.currentValue;
                    state.phase = "input";
                }
                updateDisplay(state.displayStr);
            break;

            case "input":
                //演算子による連続計算時の処理
                if(state.preValue !== "" && state.operate !== "") {
                    calculate();
                    //0除算時のエラー表示
                    if(state.isError) {
                        console.log("エラー内容：0除算されました");
                        updateDisplay("エラー");
                        return;
                    } 
                    //0除算時以外
                    state.operate = operatorValue!;//新しい演算子に置き換え
                    state.currentValue = state.resultStr;
                    state.displayStr = state.currentValue + state.operate;
                    updateDisplay(state.displayStr);
                    //初期化処理
                    state.resultStr = "";
                    state.displayStr = state.currentValue;
                    state.phase = "operator";
                    return;
                }

                //演算子による連続計算 以外の時の処理
                //「-×」のように、マイナスの後に演算子が来るのを防ぐ
                if(state.currentValue === "-") return;
                if(state.operate !== "") {
                    state.operate = operatorValue!;
                    state.displayStr = state.displayStr + operatorValue
                    updateDisplay(state.displayStr);
                    return;
                } else {
                    state.operate = operatorValue!;
                    updateDisplay(state.displayStr + operatorValue);
                }
                state.phase = "operator";
            break;
            
            case "operator":
                    state.operate = operatorValue!;
                    state.displayStr = state.currentValue + state.operate;
                    updateDisplay(state.displayStr);
            break;

            case "result":
                state.currentValue = state.resultStr;
                state.operate = operatorValue!;
                state.displayStr = state.currentValue + state.operate;
                updateDisplay(state.displayStr);
                state.phase = "operator";
            break;
         }

    })
})

//Cボタン押下時の挙動
 function clear () {
    state.phase = "initial";
    state.preValue = "0";
    state.currentValue = "0";
    state.operate = "";
    state.resultNum = 0;
    state.resultStr = "";
    state.displayStr = "0";
    state.isError = false;
    display.textContent = state.displayStr;
 }

clearBtn.addEventListener("click", () => {
    clear();
})


//＝ボタン押下時の挙動
equalBtn.addEventListener("click", () => {
    //0除算時のエラー処理
    if(state.isError) {
        console.log("エラー内容：入力は無効です。Cボタンを押してください")
        return;
    } 

    switch (state.phase) {
        case "initial":
        break;

        case "input":
            //二つの値の入力が揃っていない場合の実行を防ぐ
            if(state.operate === "") return;

            calculate();
            //0除算時のエラー表示
            if(state.isError) {
                console.log("エラー内容：0除算されました");
                updateDisplay("エラー");
                return;
            } 
            //0除算時以外
            state.displayStr = state.resultStr;
            updateDisplay(state.displayStr);
            state.preValue ="0";
            state.currentValue = "0";
            state.operate = "";
            state.phase = "result";
        break;

        case "operator":
        break;

        case "result":
        break;
    }

})
