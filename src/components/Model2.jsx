"use client";
import React, { forwardRef } from "react";
import { useGLTF } from "@react-three/drei";

export const Model = forwardRef((props, ref) => {
  Model.displayName = "Model";
  const { nodes, materials } = useGLTF("/new .glb");

  return (
    <group {...props} ref={ref} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane009.geometry}
        material={materials["NEW REIZED.002"]}
        position={[0, -2, 0]}
        rotation={[0, 2.5, 0]}
        scale={[1, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane009_1.geometry}
        material={materials["Material.001"]}
        position={[0, -2, 0]}
        rotation={[0, 2.5, 0]}
        scale={[1, 1, 1]}
      />
    </group>
  );
});

useGLTF.preload("/new .glb");
