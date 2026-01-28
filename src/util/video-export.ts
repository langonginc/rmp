import { MultiDirectedGraph } from 'graphology';
import WebMWriter from 'webm-writer';
import { EdgeAttributes, GraphAttributes, LineId, NodeAttributes, NodeId } from '../constants/constants';
import { TextLanguage } from './fonts';
import { makeRenderReadySVGElement } from './download';

export interface VideoExportOptions {
    fps: number;
    duration: number;
    isTransparent: boolean;
    scale: number;
    isSystemFontsOnly: boolean;
    quality: number;
}

export interface AnimationSequence {
    nodes: NodeId[];
    edges: LineId[];
}

// Animation timing constants
const NODE_ANIMATION_RATIO = 0.3; // 30% of animation time for nodes appearing
const EDGE_ANIMATION_RATIO = 0.7; // 70% of animation time for edges drawing
const HORIZONTAL_GROUPING_THRESHOLD = 50; // Threshold for grouping nodes horizontally
const MIN_FRAMES_PER_EDGE = 20; // Minimum frames for smooth edge animation
const EDGE_STAGGER_FRAMES = 3; // Frames to wait before starting next edge

/**
 * Determines the order in which nodes and edges should be animated.
 * Nodes are ordered by their spatial position (left to right, then top to bottom).
 * Edges are ordered after their connected nodes based on when both endpoints appear.
 */
export const generateAnimationSequence = (
    graph: MultiDirectedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>
): AnimationSequence => {
    const nodes: NodeId[] = [];
    const edges: LineId[] = [];

    // Collect all nodes with their positions
    const nodePositions: Array<{ id: NodeId; x: number; y: number }> = [];
    graph.forEachNode((node, attr) => {
        nodePositions.push({ id: node as NodeId, x: attr.x, y: attr.y });
    });

    // Sort nodes by spatial position (left to right, then top to bottom)
    nodePositions.sort((a, b) => {
        if (Math.abs(a.x - b.x) > HORIZONTAL_GROUPING_THRESHOLD) {
            return a.x - b.x;
        }
        return a.y - b.y;
    });

    nodes.push(...nodePositions.map(n => n.id));

    // Collect edges and sort them based on when their connected nodes appear
    const edgeList: Array<{ id: LineId; sourceIndex: number; targetIndex: number }> = [];
    graph.forEachEdge((edge, attr, source, target) => {
        const sourceIndex = nodes.indexOf(source as NodeId);
        const targetIndex = nodes.indexOf(target as NodeId);
        edgeList.push({
            id: edge as LineId,
            sourceIndex,
            targetIndex,
        });
    });

    // Sort edges: they should appear after both their source and target nodes
    edgeList.sort((a, b) => {
        const aMax = Math.max(a.sourceIndex, a.targetIndex);
        const bMax = Math.max(b.sourceIndex, b.targetIndex);
        return aMax - bMax;
    });

    edges.push(...edgeList.map(e => e.id));

    return { nodes, edges };
};

/**
 * Creates an SVG element with a wipe effect that reveals content from left to right.
 * Used to generate individual frames for the animation.
 */
const createFrameSVG = async (
    graph: MultiDirectedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>,
    wipeProgress: number, // 0 to 1, representing how far the wipe has progressed
    xMin: number,
    xMax: number,
    isSystemFontsOnly: boolean,
    languages: TextLanguage[],
    existsNodeTypes: Set<any>
): Promise<{ elem: SVGSVGElement; width: number; height: number }> => {
    // Create the complete SVG element with all nodes and edges
    const { elem, width, height } = await makeRenderReadySVGElement(
        graph,
        false, // don't generate RMP info
        isSystemFontsOnly,
        languages,
        existsNodeTypes,
        2 // SVG version 2
    );

    // Apply wipe effect using clip-path
    // Calculate the current reveal position based on progress
    const revealX = xMin + (xMax - xMin) * wipeProgress;

    // Create a clip-path that reveals content from left to the reveal position
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.id = 'wipe-clip';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', xMin.toString());
    rect.setAttribute('y', '-999999'); // Large enough to cover all content vertically
    rect.setAttribute('width', (revealX - xMin).toString());
    rect.setAttribute('height', '1999998'); // Large enough to cover all content vertically

    clipPath.appendChild(rect);

    // Add the clip-path definition to the SVG
    let defs = elem.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        elem.insertBefore(defs, elem.firstChild);
    }
    defs.appendChild(clipPath);

    // Wrap all non-defs children in a group to apply the clip-path
    const wrapperGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapperGroup.setAttribute('clip-path', 'url(#wipe-clip)');

    // Move all children except defs into the wrapper group
    const children = Array.from(elem.childNodes);
    for (const child of children) {
        if (child !== defs) {
            wrapperGroup.appendChild(child);
        }
    }
    elem.appendChild(wrapperGroup);

    return { elem, width, height };
};

/**
 * Renders an SVG element to a canvas at the specified scale.
 */
const renderSVGToCanvas = async (
    svgElem: SVGSVGElement,
    width: number,
    height: number,
    scale: number,
    isTransparent: boolean,
    bgColor: string
): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const scaledWidth = (width * scale) / 100;
    const scaledHeight = (height * scale) / 100;
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext('2d')!;

    // Set background if not transparent
    if (!isTransparent) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, scaledWidth, scaledHeight);
    }

    // Convert SVG to data URL
    const svgString = svgElem.outerHTML.replace(/&nbsp;/g, ' ').replace(/\p{Cc}/gu, '');
    const src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            resolve(canvas);
        };
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Exports the graph as an animated video file (WebM format).
 * Uses a wipe effect to reveal the complete map from left to right.
 */
export const exportVideo = async (
    graph: MultiDirectedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>,
    languages: TextLanguage[],
    existsNodeTypes: Set<any>,
    options: VideoExportOptions,
    bgColor: string,
    onProgress?: (progress: number) => void
): Promise<Blob> => {
    const { fps, duration, isTransparent, scale, isSystemFontsOnly, quality } = options;

    // Calculate the bounding box of all elements for the wipe effect
    const positions: number[] = [];
    graph.forEachNode((node, attr) => {
        positions.push(attr.x);
    });

    if (positions.length === 0) {
        throw new Error('No nodes to animate');
    }

    const xMin = Math.min(...positions);
    const xMax = Math.max(...positions);

    const totalFrames = Math.floor(fps * duration);

    // Initialize video writer
    const videoWriter = new WebMWriter({
        quality: quality / 100,
        frameRate: fps,
        transparent: isTransparent,
    });

    // Generate frames with wipe effect
    for (let frame = 0; frame < totalFrames; frame++) {
        // Calculate wipe progress (0 to 1)
        // Handle edge case: if only 1 frame, progress should be 1
        const wipeProgress = totalFrames <= 1 ? 1 : frame / (totalFrames - 1);

        // Create frame SVG with wipe effect
        const { elem, width, height } = await createFrameSVG(
            graph,
            wipeProgress,
            xMin,
            xMax,
            isSystemFontsOnly,
            languages,
            existsNodeTypes
        );

        // Render to canvas
        const canvas = await renderSVGToCanvas(elem, width, height, scale, isTransparent, bgColor);

        // Add frame to video
        videoWriter.addFrame(canvas);

        // Clean up
        elem.remove();

        // Report progress
        if (onProgress) {
            onProgress((frame + 1) / totalFrames);
        }
    }

    // Complete video and return blob
    const blob = await videoWriter.complete();
    return blob;
};
