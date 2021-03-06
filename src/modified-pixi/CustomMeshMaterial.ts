import { Program, Shader, TextureMatrix } from "@pixi/core";
import { Matrix } from "@pixi/math";
import { premultiplyTintToRgba } from "@pixi/utils";

import type { Texture } from "@pixi/core";
import type { Dict } from "@pixi/utils";

const meshFragment = `

  varying vec2 vTextureCoord;
  uniform vec4 uColor;

  uniform sampler2D uSampler;

  void main(void)
  {
      gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;
  }`;

const meshVertex = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat3 projectionMatrix;
  uniform mat3 translationMatrix;
  uniform mat3 uTextureMatrix;

  varying vec2 vTextureCoord;

  void main(void)
  {
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

      vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
  }`;

export interface IMeshMaterialOptions {
  alpha?: number;
  tint?: number;
  pluginName?: string;
  program?: Program;
  uniforms?: Dict<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomMeshMaterial extends GlobalMixins.MeshMaterial {}

/**
 * Slightly opinionated default shader for PixiJS 2D objects.
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 */
export class CustomMeshMaterial extends Shader {
  public readonly uvMatrix: TextureMatrix;

  public batchable: boolean;
  public pluginName: string;

  // Internal-only properties
  _tintRGB: number;

  private _colorDirty: boolean;
  private _alpha: number;
  private _tint: number;

  /**
   * @param {PIXI.Texture} uSampler - Texture that material uses to render.
   * @param {object} [options] - Additional options
   * @param {number} [options.alpha=1] - Default alpha.
   * @param {number} [options.tint=0xFFFFFF] - Default tint.
   * @param {string} [options.pluginName='batch'] - Renderer plugin for batching.
   * @param {PIXI.Program} [options.program=0xFFFFFF] - Custom program.
   * @param {object} [options.uniforms] - Custom uniforms.
   */
  constructor(uSampler: Texture, options?: IMeshMaterialOptions) {
    const uniforms = {
      uSampler,
      alpha: 1,
      uTextureMatrix: Matrix.IDENTITY,
      uColor: new Float32Array([1, 1, 1, 1]),
    };

    // Set defaults
    options = Object.assign(
      {
        tint: 0xffffff,
        alpha: 1,
        pluginName: "batch",
      },
      options
    );

    if (options.uniforms) {
      Object.assign(uniforms, options.uniforms);
    }

    super(
      options.program || Program.from(meshVertex, meshFragment, "customshader"),
      uniforms
    );

    /**
     * Only do update if tint or alpha changes.
     * @member {boolean}
     * @private
     * @default false
     */
    this._colorDirty = false;

    /**
     * TextureMatrix instance for this Mesh, used to track Texture changes
     *
     * @member {PIXI.TextureMatrix}
     * @readonly
     */
    this.uvMatrix = new TextureMatrix(uSampler);

    /**
     * `true` if shader can be batch with the renderer's batch system.
     * @member {boolean}
     * @default true
     */
    this.batchable = false; //options.program === undefined;

    /**
     * Renderer plugin for batching
     *
     * @member {string}
     * @default 'batch'
     */
    this.pluginName = "custom-plugin"; //options.pluginName;

    this.tint = options.tint;
    this.alpha = options.alpha;
  }

  /**
   * Reference to the texture being rendered.
   * @member {PIXI.Texture}
   */
  get texture(): Texture {
    return this.uniforms.uSampler;
  }
  set texture(value: Texture) {
    if (this.uniforms.uSampler !== value) {
      this.uniforms.uSampler = value;
      this.uvMatrix.texture = value;
    }
  }

  /**
   * This gets automatically set by the object using this.
   *
   * @default 1
   * @member {number}
   */
  set alpha(value: number) {
    if (value === this._alpha) return;

    this._alpha = value;
    this._colorDirty = true;
  }
  get alpha(): number {
    return this._alpha;
  }

  /**
   * Multiply tint for the material.
   * @member {number}
   * @default 0xFFFFFF
   */
  set tint(value: number) {
    if (value === this._tint) return;

    this._tint = value;
    this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
    this._colorDirty = true;
  }
  get tint(): number {
    return this._tint;
  }

  /**
   * Gets called automatically by the Mesh. Intended to be overridden for custom
   * MeshMaterial objects.
   */
  public update(): void {
    if (this._colorDirty) {
      this._colorDirty = false;
      const baseTexture = this.texture.baseTexture;

      premultiplyTintToRgba(
        this._tint,
        this._alpha,
        this.uniforms.uColor,
        baseTexture.alphaMode as unknown as boolean
      );
    }
    if (this.uvMatrix.update()) {
      this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
    }
  }
}
