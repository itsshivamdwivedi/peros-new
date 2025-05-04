"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Environment, useScroll } from "@react-three/drei";
import { Model } from "./Model2";
import * as THREE from "three";
import Content from "./Content";

export default function App() {
  const modelRef = useRef();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [currentSection, setCurrentSection] = useState(0); 

  useEffect(() => {
    document.body.style.overflow = animationComplete ? "auto" : "hidden";
  }, [animationComplete]);

  return (
    <div
      style={{
        height: "100vh",
        width: "full",
        position: "relative",
        
        overflow: animationComplete ? "auto" : "hidden",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            height: "100vh",
            width: "100vw",
            zIndex: -10,
            overflow: "hidden",
          }}
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          camera={{
            fov: 40,
            position: [10, 3, 6],
            near: 0.1,
            far: 100,
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
          <Environment files="/hdr/lobby.hdr" />

          <ScrollControls pages={15} damping={0.5}>  
            <AnimatedModel
              modelRef={modelRef}
              onComplete={() => setAnimationComplete(true)}
              setPosition={setPosition}
              currentSection={currentSection}
              setCurrentSection={setCurrentSection} 
            />
          </ScrollControls>
        </Canvas>
      </div>
    {/* <Content/> */}
    </div>
  );
}

function AnimatedModel({
  modelRef,
  onComplete,
  setPosition,
  currentSection,
  setCurrentSection,
}) {
  const scroll = useScroll();
  const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
  const targetScale = useRef(1); 
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

  const numSections = 5; 
  const [scrolling, setScrolling] = useState(false); 

  useEffect(() => {
   
    if (scrolling) {
      const newSection = Math.floor(scroll.offset * numSections);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        setScrolling(false);
      }
    }
  }, [scroll.offset, currentSection, scrolling, numSections, setCurrentSection]);

  const handleScroll = (e) => {
    if (!scrolling) {
      setScrolling(true); 
    }
  };

  useEffect(() => {
    const handleTouchStart = () => setScrolling(true);
    const handleTouchEnd = () => setScrolling(false);
  
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
  
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  
  useFrame((state, delta) => {
    const sectionRatio = scroll.offset;
    const newSection = Math.floor(scroll.offset * numSections);
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
    }
  
    targetRotation.current.set(
      Math.PI * 2 * sectionRatio,
      Math.PI * 2 * sectionRatio,
      0
    );
    targetScale.current = 2 - sectionRatio * 1.3;
    targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);
  
    if (modelRef.current) {
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        targetRotation.current.x,
        delta * 2
      );
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        targetRotation.current.y,
        delta * 2
      );
      modelRef.current.scale.lerp(
        new THREE.Vector3(
          targetScale.current,
          targetScale.current,
          targetScale.current
        ),
        delta * 2
      );
      modelRef.current.position.lerp(targetPosition.current, delta * 2);
  
      const { x, y, z } = modelRef.current.position;
      setPosition({ x, y, z });
  
      if (currentSection === numSections - 1) {
        onComplete();
      }
    }
  });

  return <Model ref={modelRef} position={[0, 0, 0]} />;
}




// "use client";

// import React, { useRef, useState, useEffect, useCallback } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { ScrollControls, Environment, useScroll } from "@react-three/drei";
// import { Model } from "./Model2";
// import * as THREE from "three";

// export default function App() {
//   const modelRef = useRef();
//   const [animationComplete, setAnimationComplete] = useState(false);
//   const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
//   const [currentSection, setCurrentSection] = useState(0);

//   useEffect(() => {
//     document.body.style.overflow = animationComplete ? "auto" : "hidden";
//   }, [animationComplete]);

//   return (
//     <div
//       style={{
//         height: "100vh",
//         width: "100%",
//         position: "relative",
//         overflow: animationComplete ? "auto" : "hidden",
//       }}
//     >
//       <div
//         style={{
//           position: "sticky",
//           top: 0,
//           height: "100vh",
//           width: "100vw",
//           overflow: "hidden",
//         }}
//       >
//         <Canvas
//           style={{
//             position: "absolute",
//             top: 0,
//             left: "50%",
//             transform: "translateX(-50%)",
//             height: "100vh",
//             width: "100vw",
//             zIndex: -10,
//             overflow: "hidden",
//           }}
//           shadows
//           dpr={[1, 1.5]}
//           gl={{ antialias: true }}
//           camera={{
//             fov: 40,
//             position: [10, 3, 6],
//             near: 0.1,
//             far: 100,
//           }}
//         >
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
//           <Environment files="/hdr/lobby.hdr" />

//           <ScrollControls pages={5} damping={0.5}>
//             <AnimatedModel
//               modelRef={modelRef}
//               onComplete={() => setAnimationComplete(true)}
//               setPosition={setPosition}
//               currentSection={currentSection}
//               setCurrentSection={setCurrentSection}
//             />
//           </ScrollControls>
//         </Canvas>
//       </div>
//     </div>
//   );
// }

// const AnimatedModel = React.memo(
//   ({
//     modelRef,
//     onComplete,
//     setPosition,
//     currentSection,
//     setCurrentSection,
//   }) => {
//     const scroll = useScroll();
//     const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
//     const targetScale = useRef(1);
//     const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

//     const numSections = 5; // Reduced number of sections for optimization
//     const [scrolling, setScrolling] = useState(false);

//     const updateSection = useCallback(() => {
//       const newSection = Math.floor(scroll.offset * numSections);
//       if (newSection !== currentSection) {
//         setCurrentSection(newSection);
//       }
//     }, [scroll.offset, currentSection, setCurrentSection, numSections]);

//     useEffect(() => {
//       if (scrolling) {
//         updateSection();
//         setScrolling(false);
//       }
//     }, [scrolling, updateSection]);

//     useEffect(() => {
//       const handleTouchMove = () => setScrolling(true);

//       window.addEventListener("touchmove", handleTouchMove);

//       return () => {
//         window.removeEventListener("touchmove", handleTouchMove);
//       };
//     }, []);

//     useFrame((state, delta) => {
//       const sectionRatio = scroll.offset;
//       const newSection = Math.floor(scroll.offset * numSections);
//       if (newSection !== currentSection) {
//         setCurrentSection(newSection);
//       }

//       targetRotation.current.set(
//         Math.PI * 2 * sectionRatio,
//         Math.PI * 2 * sectionRatio,
//         0
//       );
//       targetScale.current = 2 - sectionRatio * 1.3;
//       targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);

//       if (modelRef.current) {
//         modelRef.current.rotation.x = THREE.MathUtils.lerp(
//           modelRef.current.rotation.x,
//           targetRotation.current.x,
//           delta * 2
//         );
//         modelRef.current.rotation.y = THREE.MathUtils.lerp(
//           modelRef.current.rotation.y,
//           targetRotation.current.y,
//           delta * 2
//         );
//         modelRef.current.scale.lerp(
//           new THREE.Vector3(
//             targetScale.current,
//             targetScale.current,
//             targetScale.current
//           ),
//           delta * 2
//         );
//         modelRef.current.position.lerp(targetPosition.current, delta * 2);

//         const { x, y, z } = modelRef.current.position;
//         setPosition({ x, y, z });

//         if (currentSection === numSections - 1) {
//           onComplete();
//         }
//       }
//     });

//     return <Model ref={modelRef} position={[0, 0, 0]} />;
//   }
// );

// "use client";

// import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { ScrollControls, Environment, useScroll } from "@react-three/drei";
// import { Model } from "./Model2"; 
// import * as THREE from "three";

// // Debounce function to optimize scroll event handling
// const debounce = (func, delay) => {
//   let timeout;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), delay);
//   };
// };

// const AppComponent = () => {
//   const modelRef = useRef();
//   const [animationComplete, setAnimationComplete] = useState(false);
//   const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
//   const [currentSection, setCurrentSection] = useState(0);

//   useEffect(() => {
//     document.body.style.overflow = animationComplete ? "auto" : "hidden";
//   }, [animationComplete]);

//   const onComplete = useCallback(() => {
//     setAnimationComplete(true); // Mark animation as complete
//   }, []);

//   return (
//     <div
//       style={{
//         height: "100vh",
//         width: "100%",
//         position: "relative",
//         overflow: animationComplete ? "auto" : "hidden",
//       }}
//     >
//       <div
//         style={{
//           position: "sticky",
//           top: 0,
//           height: "100vh",
//           width: "100vw",
//           overflow: "hidden",
//         }}
//       >
//         <Canvas
//           style={{
//             position: "absolute",
//             top: 0,
//             left: "50%",
//             transform: "translateX(-50%)",
//             height: "100vh",
//             width: "100vw",
//             zIndex: -10,
//             overflow: "hidden",
//           }}
//           shadows
//           dpr={[1, 1.5]}
//           gl={{ antialias: true }}
//           camera={{
//             fov: 40,
//             position: [10, 3, 6],
//             near: 0.1,
//             far: 100,
//           }}
//         >
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
//           <Environment files="/hdr/lobby.hdr" />

//           <ScrollControls pages={5} damping={0.5}>
//             <AnimatedModel
//               modelRef={modelRef}
//               onComplete={onComplete}
//               setPosition={setPosition}
//               currentSection={currentSection}
//               setCurrentSection={setCurrentSection}
//               animationComplete={animationComplete} // Pass animationComplete state here
//             />
//           </ScrollControls>
//         </Canvas>
//       </div>
//     </div>
//   );
// };

// AppComponent.displayName = "App";

// const AnimatedModel = ({
//   modelRef,
//   onComplete,
//   setPosition,
//   currentSection,
//   setCurrentSection,
//   animationComplete, // Get animationComplete state from AppComponent
// }) => {
//   const scroll = useScroll();
//   const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
//   const targetScale = useRef(1);
//   const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

//   const numSections = 25;
//   const [scrolling, setScrolling] = useState(false);

//   // Optimized scroll event handler
//   const updateSection = useCallback(
//     debounce(() => {
//       const newSection = Math.floor(scroll.offset * numSections);
//       if (newSection !== currentSection) {
//         setCurrentSection(newSection);
//       }
//     }, 50), // Delay to avoid frequent updates
//     [scroll.offset, currentSection, setCurrentSection, numSections]
//   );

//   useEffect(() => {
//     if (scrolling) {
//       updateSection();
//       setScrolling(false);
//     }
//   }, [scrolling, updateSection]);

//   useEffect(() => {
//     const handleTouchMove = () => setScrolling(true);

//     window.addEventListener("touchmove", handleTouchMove);

//     return () => {
//       window.removeEventListener("touchmove", handleTouchMove);
//     };
//   }, []);

//   useFrame((state, delta) => {
//     if (animationComplete) {
//       // Once animation is complete, hide the jar and stop further updates
//       if (modelRef.current) {
//         modelRef.current.visible = false; // Hide the model (jar)
//       }
//       return; // Skip further updates after animation completion
//     }

//     const sectionRatio = scroll.offset;
//     const newSection = Math.floor(scroll.offset * numSections);
//     if (newSection !== currentSection) {
//       setCurrentSection(newSection);
//     }

//     targetRotation.current.set(
//       Math.PI * 2 * sectionRatio,
//       Math.PI * 2 * sectionRatio,
//       0
//     );
//     targetScale.current = 2 - sectionRatio * 1.3;
//     targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);

//     if (modelRef.current) {
//       modelRef.current.rotation.x = THREE.MathUtils.lerp(
//         modelRef.current.rotation.x,
//         targetRotation.current.x,
//         delta * 2
//       );
//       modelRef.current.rotation.y = THREE.MathUtils.lerp(
//         modelRef.current.rotation.y,
//         targetRotation.current.y,
//         delta * 2
//       );
//       modelRef.current.scale.lerp(
//         new THREE.Vector3(
//           targetScale.current,
//           targetScale.current,
//           targetScale.current
//         ),
//         delta * 2
//       );
//       modelRef.current.position.lerp(targetPosition.current, delta * 2);

//       const { x, y, z } = modelRef.current.position;
//       setPosition({ x, y, z });

//       if (currentSection === numSections - 1) {
//         onComplete(); // Trigger completion callback when the last section is reached
//       }
//     }
//   });

//   const renderModel = useMemo(() => {
//     return <Model ref={modelRef} />;
//   }, [modelRef]);

//   return renderModel;
// };

// AnimatedModel.displayName = "AnimatedModel";

// export default AppComponent;

// "use client";

// import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { ScrollControls, Environment, useScroll } from "@react-three/drei";
// import { Model } from "./Model2"; 
// import * as THREE from "three";


// const debounce = (func, delay) => {
//   let timeout;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), delay);
//   };
// };

// const AppComponent = () => {
//   const modelRef = useRef();
//   const [animationComplete, setAnimationComplete] = useState(false);
//   const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
//   const [currentSection, setCurrentSection] = useState(0);

//   useEffect(() => {
//     document.body.style.overflow = animationComplete ? "auto" : "hidden";
//   }, [animationComplete]);

//   const onComplete = useCallback(() => {
//     setAnimationComplete(true); 
//   }, []);

//   return (
//     <div
//       style={{
//         height: "100vh",
//         width: "100%",
//         position: "relative",
//         overflow: animationComplete ? "auto" : "hidden",
//       }}
//     >
//       <div
//         style={{
//           position: "sticky",
//           top: 0,
//           height: "100vh",
//           width: "100vw",
//           overflow: "hidden",
//         }}
//       >
//         <Canvas
//           style={{
//             position: "absolute",
//             top: 0,
//             left: "50%",
//             transform: "translateX(-50%)",
//             height: "100vh",
//             width: "100vw",
//             zIndex: -10,
//             overflow: "hidden",
//           }}
//           shadows
//           dpr={[1, 1.5]}
//           gl={{ antialias: true }}
//           camera={{
//             fov: 40,
//             position: [10, 3, 6],
//             near: 0.1,
//             far: 100,
//           }}
//         >
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
//           <Environment files="/hdr/lobby.hdr" />

//           <ScrollControls pages={5} damping={0.5}>
//             <AnimatedModel
//               modelRef={modelRef}
//               onComplete={onComplete}
//               setPosition={setPosition}
//               currentSection={currentSection}
//               setCurrentSection={setCurrentSection}
//               animationComplete={animationComplete} 
//             />
//           </ScrollControls>
//         </Canvas>
//       </div>

  
//       {animationComplete && (
//         <img
//           src="/assets/Jar.png" 
//           alt="Replaced Image"
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: "500px",
//           }}
//         />
//       )}
//     </div>
//   );
// };

// AppComponent.displayName = "App";

// const AnimatedModel = ({
//   modelRef,
//   onComplete,
//   setPosition,
//   currentSection,
//   setCurrentSection,
//   animationComplete, 
// }) => {
//   const scroll = useScroll();
//   const targetRotation = useRef(new THREE.Vector3(0, 0, 0));
//   const targetScale = useRef(1);
//   const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

//   const numSections = 30;
//   const [scrolling, setScrolling] = useState(false);

  
//   const updateSection = useCallback(
//     debounce(() => {
//       const newSection = Math.floor(scroll.offset * numSections);
//       if (newSection !== currentSection) {
//         setCurrentSection(newSection);
//       }
//     }, 50),
//     [scroll.offset, currentSection, setCurrentSection, numSections]
//   );

//   useEffect(() => {
//     if (scrolling) {
//       updateSection();
//       setScrolling(false);
//     }
//   }, [scrolling, updateSection]);

//   useEffect(() => {
//     const handleTouchMove = () => setScrolling(true);

//     window.addEventListener("touchmove", handleTouchMove);

//     return () => {
//       window.removeEventListener("touchmove", handleTouchMove);
//     };
//   }, []);

//   useFrame((state, delta) => {
//     if (animationComplete) {
     
//       if (modelRef.current) {
//         modelRef.current.visible = false;
//       }
//       return; 
//     }

//     const sectionRatio = scroll.offset;
//     const newSection = Math.floor(scroll.offset * numSections);
//     if (newSection !== currentSection) {
//       setCurrentSection(newSection);
//     }

//     targetRotation.current.set(
//       Math.PI * 2 * sectionRatio,
//       Math.PI * 2 * sectionRatio,
//       0
//     );
//     targetScale.current = 2 - sectionRatio * 1.3;
//     targetPosition.current.set(0, -0.5 * (targetScale.current - 1), 0);

//     if (modelRef.current) {
//       modelRef.current.rotation.x = THREE.MathUtils.lerp(
//         modelRef.current.rotation.x,
//         targetRotation.current.x,
//         delta * 2
//       );
//       modelRef.current.rotation.y = THREE.MathUtils.lerp(
//         modelRef.current.rotation.y,
//         targetRotation.current.y,
//         delta * 2
//       );
//       modelRef.current.scale.lerp(
//         new THREE.Vector3(
//           targetScale.current,
//           targetScale.current,
//           targetScale.current
//         ),
//         delta * 2
//       );
//       modelRef.current.position.lerp(targetPosition.current, delta * 2);

//       const { x, y, z } = modelRef.current.position;
//       setPosition({ x, y, z });

//       if (currentSection === numSections - 1) {
//         onComplete();
//       }
//     }
//   });

//   const renderModel = useMemo(() => {
//     return <Model ref={modelRef} />;
//   }, [modelRef]);

//   return renderModel;
// };

// AnimatedModel.displayName = "AnimatedModel";

// export default AppComponent;
