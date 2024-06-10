import React, { ReactElement } from 'react';
import * as THREE from 'three';
import { WEBGL } from '../../utils/webGLUtils/webGLUtils';
import { setupSquareGameLights, squareGameFunctionality } from '../../utils/squareGameUtils/squareGameUtils';
import './SquareGameContainer.css';

export const SquareGameContainer = (): ReactElement => {

    const [quality, setQuality] = React.useState<number>(1); // 2.5 = low quality | 1 = highest quality

    const toggleQuality = () => {
        if (quality === 2.5) {
            setQuality(1);
        } else {
            setQuality(2.5);
        }
    };

    React.useEffect(() => {
        // This runs twice when running this locally, but only once when you build or deploy the code.
        if ( WEBGL.isWebGLAvailable() ) {
            
            // Renderer setup
            let renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); // needs 'alpha' to be true for CSS gradient background
            renderer.setSize( window.innerWidth, window.innerHeight);
            renderer.setPixelRatio( window.devicePixelRatio/quality );
            renderer.autoClear = false;
            renderer.clear();

            let isMobileAspectRatio = false;
            console.log('window height: ', window.innerHeight)
            console.log('window width: ', window.innerWidth)
            if(window.innerHeight > window.innerWidth) {
                isMobileAspectRatio = true;
            }

            renderer.domElement.id = 'dom';
            renderer.domElement.className = 'position-fixed';
            if (document.body.contains( document.getElementById( 'dom' ) ) === false) {
                document.body.append( renderer.domElement );
            } else {
                const dom = document.getElementById('dom');
                if(dom !== null) {
                    document.body.removeChild( dom );
                    document.body.append( renderer.domElement );
                } 
            };

            // Camera / Scene setup
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
            camera.position.set(0, 0, 0);
            //camera.setFocalLength(35);

            setupSquareGameLights( scene );

            squareGameFunctionality( scene, renderer, camera, quality, isMobileAspectRatio );
            
        } else {
            const warning = WEBGL.getWebGLErrorMessage();
            document.body.appendChild( warning );
        }
    }, [quality]);

    return (
        <div data-testid='canvas' id='canvas'>
            <button id='qualityBtn' onClick={toggleQuality}>
                QUALITY
            </button>
            <div id='timerContainer'>
                <div id='timerCircleAni'>
                    <div id='timerBigLineAni'></div>
                    <div id='timerMiddleDot'></div>
                    <div id='timerSmallLineAni'></div>
                </div>
                <div id='timerDiv'></div>
            </div>
            <div id='instructionsContainer'>
                <div id='instructionsText'>Avoid the Squares!</div>
            </div>
            <div id='winLoseText'></div>
        </div>
    )
};