import React, {useEffect, useRef} from "react";
// @ts-ignore
import styles from "./Canvas.module.css";
import {draw} from "./draw";

export function Canvas(){
    const elementRef = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        window.addEventListener("resize", ()=>{
            if(elementRef.current){
                elementRef.current.width = window.innerWidth;
                elementRef.current.height = window.innerHeight;
            }
        })

        if(elementRef.current){
            const context = elementRef.current.getContext("2d");
            if(context){
                draw(context);
            }
        }
    });
    return(
        <canvas className={styles.canvas} width={window.innerWidth} height={window.innerHeight} ref={elementRef}/>
    )
}