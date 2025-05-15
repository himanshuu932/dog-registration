import { useState, useEffect } from 'react';

// Running Dog Loader with Grass and Greenery
export default function RunningDogLoader() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulating loading completion after 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="loader-container">
      {isLoading ? (
        <div className="main">
          <div className="scene">
            <div className="grass"></div>
            <div className="grass grass-2"></div>
            <div className="grass grass-3"></div>
            <div className="sun"></div>
            <div className="tree tree-1">
              <div className="trunk"></div>
              <div className="leaves"></div>
            </div>
            <div className="tree tree-2">
              <div className="trunk"></div>
              <div className="leaves"></div>
            </div>
            <div className="bush bush-1"></div>
            <div className="bush bush-2"></div>
            <div className="dog">
              <div className="dog__paws">
                <div className="dog__bl-leg leg">
                  <div className="dog__bl-paw paw"></div>
                  <div className="dog__bl-top top"></div>
                </div>
                <div className="dog__fl-leg leg">
                  <div className="dog__fl-paw paw"></div>
                  <div className="dog__fl-top top"></div>
                </div>
                <div className="dog__fr-leg leg">
                  <div className="dog__fr-paw paw"></div>
                  <div className="dog__fr-top top"></div>
                </div>
              </div>
              <div className="dog__body">
                <div className="dog__tail"></div>
              </div>
              <div className="dog__head">
                <div className="dog__snout">
                  <div className="dog__nose"></div>
                  <div className="dog__eyes">
                    <div className="dog__eye-l"></div>
                    <div className="dog__eye-r"></div>
                  </div>
                </div>
              </div>
              <div className="dog__head-c">
                <div className="dog__ear-r"></div>
                <div className="dog__ear-l"></div>
              </div>
            </div>
          
          </div>
        </div>
      ) : (
       <div/>
      )}
      
      <style jsx>{`
        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100%;
          background-color: #ddf0dd;
        }
        
        .content {
          font-size: 24px;
          color: #333;
        }
        
        .main {
          position: relative;
          width: 40vmax;
          height: 30vmax;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .scene {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(#87ceeb, #e0f7fa);
          overflow: hidden;
        }
        
        .grass {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 5vmax;
          background: linear-gradient(#67a55e, #4c8c42);
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
        
        .grass-2 {
          height: 4vmax;
          background: linear-gradient(#82c875, #5fa054);
          width: 60%;
          left: 10%;
          bottom: 0.5vmax;
          border-radius: 50%;
        }
        
        .grass-3 {
          height: 3vmax;
          background: linear-gradient(#96dd88, #73c367);
          width: 40%;
          left: 50%;
          bottom: 1vmax;
          border-radius: 50%;
        }
        
        .sun {
          position: absolute;
          top: 3vmax;
          right: 5vmax;
          width: 5vmax;
          height: 5vmax;
          background-color: #ffeb3b;
          border-radius: 50%;
          box-shadow: 0 0 20px 5px rgba(255, 235, 59, 0.5);
        }
        
        .tree {
          position: absolute;
          bottom: 5vmax;
        }
        
        .tree-1 {
          left: 3vmax;
        }
        
        .tree-2 {
          right: 5vmax;
        }
        
        .trunk {
          width: 1.5vmax;
          height: 6vmax;
          background: linear-gradient(#8b4513, #a0522d);
          border-radius: 0.5vmax;
        }
        
        .leaves {
          position: absolute;
          bottom: 5vmax;
          left: -2vmax;
          width: 6vmax;
          height: 6vmax;
          background-color: #2e7d32;
          border-radius: 50%;
        }
        
        .bush {
          position: absolute;
          bottom: 5vmax;
          width: 4vmax;
          height: 2vmax;
          background-color: #43a047;
          border-radius: 50%;
        }
        
        .bush-1 {
          left: 40%;
        }
        
        .bush-2 {
          left: 70%;
        }
    
        
        .leg {
          position: absolute;
          bottom: 0;
          width: 2vmax;
          height: 2.125vmax;
        }
        
        .paw {
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 1.95vmax;
          height: 1.8vmax;
          overflow: hidden;
        }
        
        .paw::before {
          content: "";
          position: absolute;
          width: 5vmax;
          height: 3vmax;
          border-radius: 50%;
        }
        
        .top {
          position: absolute;
          bottom: 0;
          left: 0.75vmax;
          height: 4.5vmax;
          width: 2.625vmax;
          border-top-left-radius: 1.425vmax;
          border-top-right-radius: 1.425vmax;
          transform-origin: bottom right;
          transform: rotateZ(90deg) translateX(-0.1vmax) translateY(1.5vmax);
          z-index: -1;
          background-image: linear-gradient(70deg, transparent 20%, #deac80 20%);
        }
        
        .dog {
          position: absolute;
          width: 20vmax;
          height: 8vmax;
          bottom: 4vmax;
          animation: run 6s linear infinite;
        }
        
        .dog::before {
          content: "";
          position: absolute;
          bottom: -0.75vmax;
          right: -0.15vmax;
          width: 100%;
          height: 1.5vmax;
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          z-index: -1000;
          animation: shadow 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__head {
          position: absolute;
          left: 4.5vmax;
          bottom: 0;
          width: 8vmax;
          height: 5vmax;
          border-top-left-radius: 4.05vmax;
          border-top-right-radius: 4.05vmax;
          border-bottom-right-radius: 3.3vmax;
          border-bottom-left-radius: 3.3vmax;
          background-color: #deac80;
          animation: head 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__head-c {
          position: absolute;
          left: 1.5vmax;
          bottom: 0;
          width: 9.75vmax;
          height: 8.25vmax;
          animation: head 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
          z-index: -1;
        }
        
        .dog__snout {
          position: absolute;
          left: -1.5vmax;
          bottom: 0;
          width: 7.5vmax;
          height: 3.75vmax;
          border-top-right-radius: 3vmax;
          border-bottom-right-radius: 3vmax;
          border-bottom-left-radius: 4.5vmax;
          background-color: #f7dcb9;
          animation: snout 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__snout::before {
          content: "";
          position: absolute;
          left: -0.1125vmax;
          top: -0.15vmax;
          width: 1.875vmax;
          height: 1.125vmax;
          border-top-right-radius: 3vmax;
          border-bottom-right-radius: 3vmax;
          border-bottom-left-radius: 4.5vmax;
          background-color: #6c4e31;
          animation: snout-b 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__nose {
          position: absolute;
          top: 0.75vmax;
          left: 1vmax;
          width: 0.75vmax;
          height: 0.75vmax;
          border-radius: 50%;
          background-color: #1c3130;
        }
        
        .dog__eye-l,
        .dog__eye-r {
          position: absolute;
          top: -0.9vmax;
          width: 0.675vmax;
          height: 0.375vmax;
          border-radius: 50%;
          background-color: #1c3130;
          animation: eye 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__eye-l {
          left: 27%;
        }
        
        .dog__eye-r {
          left: 65%;
        }
        
        .dog__ear-l,
        .dog__ear-r {
          position: absolute;
          width: 5vmax;
          height: 3.3vmax;
          border-top-left-radius: 3.3vmax;
          border-top-right-radius: 3vmax;
          border-bottom-right-radius: 5vmax;
          border-bottom-left-radius: 5vmax;
          background-color: #deac80;
        }
        
        .dog__ear-l {
          top: 1.5vmax;
          left: 10vmax;
          transform-origin: bottom left;
          transform: rotateZ(-50deg);
          z-index: -1;
          animation: ear-l 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__ear-r {
          top: 1.5vmax;
          right: 3vmax;
          transform-origin: bottom right;
          transform: rotateZ(25deg);
          z-index: -2;
          animation: ear-r 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__body {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          position: absolute;
          bottom: 0.3vmax;
          left: 6vmax;
          width: 18vmax;
          height: 4vmax;
          border-top-left-radius: 3vmax;
          border-top-right-radius: 6vmax;
          border-bottom-right-radius: 1.5vmax;
          border-bottom-left-radius: 6vmax;
          background-color: #914f1e;
          z-index: -2;
          animation: body 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__tail {
          position: absolute;
          top: -1vmax;
          right: -1.5vmax;
          height: 3vmax;
          width: 4vmax;
          background-color: #914f1e;
          border-radius: 1.5vmax;
          transform-origin: bottom left;
          animation: tail 1s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        
        .dog__paws {
          position: absolute;
          bottom: 0;
          left: 7.5vmax;
          width: 10vmax;
          height: 3vmax;
        }
        
        .dog__bl-leg {
          left: -3vmax;
          z-index: -10;
          animation: bl-leg 1s linear infinite;
        }
        
        .dog__bl-paw::before {
          background-color: #fffbe6;
        }
        
        .dog__bl-top {
          background-image: linear-gradient(80deg, transparent 20%, #deac80 20%);
        }
        
        .dog__fl-leg {
          z-index: 10;
          left: 0;
          animation: fl-leg 1s linear infinite;
        }
        
        .dog__fl-paw::before {
          background-color: #fffbe6;
        }
        
        .dog__fr-leg {
          right: 0;
          animation: fr-leg 1s linear infinite;
        }
        
        .dog__fr-paw::before {
          background-color: #fffbe6;
        }
        
        @keyframes run {
          0% {
            transform: translateX(-40vmax);
          }
          100% {
            transform: translateX(40vmax);
          }
        }
        
        @keyframes head {
          0%, 100% {
            height: 8.25vmax;
            bottom: 0;
            transform-origin: bottom right;
            transform: rotateZ(0);
          }
          25% {
            height: 8.1vmax;
          }
          50% {
            height: 8.25vmax;
          }
          75% {
            bottom: 0.3vmax;
          }
        }
        
        @keyframes body {
          0%, 100% {
            height: 7.2vmax;
          }
          25%, 75% {
            height: 7.05vmax;
          }
        }
        
        @keyframes ear-l {
          0%, 100% {
            transform: rotateZ(-50deg);
          }
          25%, 75% {
            transform: rotateZ(-48deg);
          }
          50% {
            transform: rotateZ(-60deg);
          }
        }
        
        @keyframes ear-r {
          0%, 100% {
            transform: rotateZ(20deg);
          }
          25%, 75% {
            transform: rotateZ(18deg);
          }
          50% {
            transform: rotateZ(25deg);
          }
        }
        
        @keyframes snout {
          0%, 100% {
            height: 3.75vmax;
          }
          25%, 75% {
            height: 3.45vmax;
          }
        }
        
        @keyframes snout-b {
          0%, 100% {
            width: 1.875vmax;
          }
          25%, 75% {
            width: 1.8vmax;
          }
          50% {
            width: 1.275vmax;
          }
        }
        
        @keyframes shadow {
          0%, 100% {
            width: 99%;
            opacity: 0.6;
          }
          50% {
            width: 90%;
            opacity: 0.3;
          }
        }
        
        @keyframes eye {
          0%, 100% {
            width: 0.675vmax;
            height: 0.3vmax;
          }
          50% {
            width: 0.525vmax;
            height: 0.525vmax;
          }
        }
        
        @keyframes tail {
          0%, 100% {
            transform: rotateZ(0deg);
          }
          50% {
            transform: rotateZ(20deg);
          }
        }
        
        @keyframes fl-leg {
          0%, 100% {
            transform: translateY(0) rotateZ(0);
          }
          25% {
            transform: translateY(-10%) rotateZ(5deg);
          }
          50% {
            transform: translateY(0) rotateZ(0);
          }
          75% {
            transform: translateY(10%) rotateZ(-5deg);
          }
        }
        
        @keyframes fr-leg {
          0%, 100% {
            transform: translateY(10%) rotateZ(-5deg);
          }
          25% {
            transform: translateY(0) rotateZ(0);
          }
          50% {
            transform: translateY(-10%) rotateZ(5deg);
          }
          75% {
            transform: translateY(0) rotateZ(0);
          }
        }
        
        @keyframes bl-leg {
          0%, 100% {
            transform: translateY(-10%) rotateZ(5deg);
          }
          25% {
            transform: translateY(0) rotateZ(0);
          }
          50% {
            transform: translateY(10%) rotateZ(-5deg);
          }
          75% {
            transform: translateY(0) rotateZ(0);
          }
        }
      `}</style>
    </div>
  );
}