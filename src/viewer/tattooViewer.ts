import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

import walkerFbxUrl from "./walker.fbx?url";
import dragonImgUrl from "./dragon.jpeg?url";

interface IConfig {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
}

export default class TattooViewer {
  private readonly _container!: HTMLElement;
  private readonly _canvas!: HTMLCanvasElement;

  private readonly _scene = new THREE.Scene();
  private _renderer!: THREE.WebGLRenderer;

  private _camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);

  private _hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);

  private _dirLight = new THREE.DirectionalLight(0xffffff, 0.3);

  private _planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );

  private _controls!: OrbitControls;

  constructor({ container, canvas }: IConfig) {
    this._canvas = canvas;
    this._container = container;
    this.init().then(() => {
      // eslint-disable-next-line no-console
      console.log("初始化完成");
    });
  }

  // 初始化
  private init = async () => {
    // 场景
    this._scene.background = new THREE.Color(0xa0a0a0);
    this._scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
    // 相机
    this._camera.position.set(-1, 2, 3);
    // 环境光
    this._hemiLight.position.set(0, 20, 0);
    this._scene.add(this._hemiLight);

    // 方向光
    this._dirLight.position.set(3, 10, 10);
    this._dirLight.castShadow = true;
    this._dirLight.shadow.camera.top = 2;
    this._dirLight.shadow.camera.bottom = -2;
    this._dirLight.shadow.camera.left = -2;
    this._dirLight.shadow.camera.right = 2;
    this._dirLight.shadow.camera.near = 0.1;
    this._dirLight.shadow.camera.far = 40;
    this._scene.add(this._dirLight);

    // 地板
    this._planeMesh.rotation.x = -Math.PI / 2;
    this._planeMesh.receiveShadow = true;
    this._scene.add(this._planeMesh);

    // 加载模特
    const loader = new FBXLoader();

    const fbxModel = await loader.loadAsync(walkerFbxUrl);

    this._scene.add(fbxModel);

    fbxModel.scale.set(0.001, 0.001, 0.001);

    const walkerMesh = fbxModel.children.find((object) => object instanceof THREE.Mesh)! as THREE.Mesh;

    walkerMesh.castShadow = true;

    (walkerMesh.material as THREE.MeshPhongMaterial).color.setHex(0xffdbac);
    // TODO 多materials start
    //
    const textureLoader = new THREE.TextureLoader(); // 纹理加载器
    const texture = await textureLoader.loadAsync(dragonImgUrl); // 加载图片，返回Texture对象

    (walkerMesh.material as THREE.MeshPhongMaterial).map = texture;
    (walkerMesh.material as THREE.MeshPhongMaterial).map!.offset.set(-0.2, 0);
    (walkerMesh.material as THREE.MeshPhongMaterial).map!.repeat.set(1, 1);
    // (walkerMesh.material as THREE.MeshPhongMaterial).map!.matrixAutoUpdate = false;
    // end

    // 计算法线
    walkerMesh.geometry.computeVertexNormals();

    // 渲染器
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._container.appendChild(this._renderer.domElement);

    // 控制器
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enablePan = false;
    // this._controls.enableZoom = false;
    this._controls.target.set(0, 1, 0);
    this._controls.update();

    // 开启动画
    this.animate();
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this._renderer.render(this._scene, this._camera);
  };
}
