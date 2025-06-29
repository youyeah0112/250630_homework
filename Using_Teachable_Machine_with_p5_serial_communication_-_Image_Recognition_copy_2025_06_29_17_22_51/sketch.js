// 모델 URL과 포트 번호 입력
const modelURL = 'https://teachablemachine.withgoogle.com/models/90U_MWbZO/';
const serialPort = 'COM6'; // 연결된 포트 번호

// 변수 선언
let classifier;
let serial;
let video;
let flippedVideo;
let label = "";  // 예측된 라벨
let bgColor = [0, 0, 0]; // 기본 배경색 (검정)
let lastChangeTime = 0;  // 마지막 색상 변경 시간
let colorChangeDelay = 2000;  // 색상 변경 지연 시간 (2초)
let hasChanged = false; // 색상이 변경되었는지 여부


let canvasWidth = 500;
let canvasHeight = 400;


function preload() {
    
    classifier = ml5.imageClassifier(modelURL + 'model.json');
    serial = new p5.SerialPort();
}

function setup() {
    serial.open(serialPort); 
    createCanvas(canvasWidth, canvasHeight); 
    video = createCapture(VIDEO);
    video.size(canvasWidth, canvasHeight); // 비디오 사이즈를 캔버스 크기와 동일하게
    video.hide(); // 비디오 화면을 안보이게끔
    
    classifyVideo(); // classifyVideo 함수 실행
}

function draw() {
    background(bgColor); // 배경 색상 설정

    // "눈을 감았다 뜨면 세상이 다르게 보입니다" 
    fill(255); 
    textSize(24);
    textAlign(CENTER, CENTER); 
    text("눈을 감았다 뜨면 세상이 다르게 보입니다", width / 2, height / 2 - 50);

    // 웹캠 비디오
    tint(255, 100); 
    image(video, 0, 0); 

    // 라벨 텍스트
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text(label, width / 2, height - 4); 
}

// 비디오 분류
function classifyVideo() {
    flippedVideo = ml5.flipImage(video); 
    classifier.classify(flippedVideo, gotResult);  // 분류 후 콜백 함수 실행
      flippedVideo.remove();
}

function gotResult(error, results) {
    //에러일 경우
    if (error) {
        console.error(error);
        return; 
    }
    
    label = String(results[0].label);
    console.log(label); // label 출력
    
    if (label === "open") {
        if (!hasChanged) {
            bgColor = [random(255), random(255), random(255)]; // 랜덤 색상 생성
            hasChanged = true; // 색상 변경 완료
        }
        lastChangeTime = millis(); // 마지막 변경 시간 갱신
    }

    if (label === "close" && millis() - lastChangeTime > colorChangeDelay) {
        hasChanged = false; // 'close' 상태에서 2초가 지나면 색상 변경 대기
    }

    serial.write(label); // label 송신
    classifyVideo(); // 다시 분류 시작
}
