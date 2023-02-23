import React from 'react';
import { CityCode, MonoColour } from '@railmapgen/rmg-palette-resources';
import { MiscNodeType, Node, NodeComponentProps } from '../../../constants/nodes';
import { AttributesWithColor, ColorField } from '../../panels/details/color-field';

const BjsubwayNumLineBadge = (props: NodeComponentProps<BjsubwayNumLineBadgeAttributes>) => {
    const { id, x, y, attrs, handlePointerDown, handlePointerMove, handlePointerUp } = props;
    const { num = defaultBjsubwayNumLineBadgeAttributes.num, color = defaultBjsubwayNumLineBadgeAttributes.color } =
        attrs ?? defaultBjsubwayNumLineBadgeAttributes;

    const numEl = React.useRef<SVGTextElement | null>(null);
    const [bBox, setBBox] = React.useState({ width: 12 } as DOMRect);
    React.useEffect(() => setBBox(numEl.current!.getBBox()), [num, setBBox, numEl]);

    const onPointerDown = React.useCallback(
        (e: React.PointerEvent<SVGElement>) => handlePointerDown(id, e),
        [id, handlePointerDown]
    );
    const onPointerMove = React.useCallback(
        (e: React.PointerEvent<SVGElement>) => handlePointerMove(id, e),
        [id, handlePointerMove]
    );
    const onPointerUp = React.useCallback(
        (e: React.PointerEvent<SVGElement>) => handlePointerUp(id, e),
        [id, handlePointerUp]
    );

    return React.useMemo(
        () => (
            <g id={id} transform={`translate(${x}, ${y})scale(2)`}>
                <rect fill={color[2]} x="0" width={bBox.width + 24} height="16" rx="2" />
                <text
                    ref={numEl}
                    className="rmp-name__zh"
                    textAnchor="middle"
                    x={bBox.width / 2 + 2}
                    y="14"
                    fill={color[3]}
                >
                    {num}
                </text>
                <text className="rmp-name__zh" x={bBox.width + 3} y="9" fontSize="10" fill={color[3]}>
                    号线
                </text>
                <text className="rmp-name__en" x={bBox.width + 4} y="15" fontSize="5" fill={color[3]}>
                    Line {num}
                </text>
                {/* Below is an overlay element that has all event hooks but can not be seen. */}
                <rect
                    fill="white"
                    fillOpacity="0"
                    x="0"
                    width={bBox.width + 24}
                    height="16"
                    rx="2"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    style={{ cursor: 'move' }}
                />
            </g>
        ),
        [id, x, y, num, ...color, bBox, onPointerDown, onPointerMove, onPointerUp]
    );
};

/**
 * BjsubwayNumLineBadge specific props.
 */
export interface BjsubwayNumLineBadgeAttributes extends AttributesWithColor {
    num: number;
}

const defaultBjsubwayNumLineBadgeAttributes: BjsubwayNumLineBadgeAttributes = {
    num: 1,
    color: [CityCode.Beijing, 'bj1', '#c23a30', MonoColour.white],
};

const BjsubwayNumLineBadgeFields = [
    {
        type: 'input',
        label: 'panel.details.node.bjsubwayNumLineBadge.num',
        value: (attrs?: BjsubwayNumLineBadgeAttributes) => (attrs ?? defaultBjsubwayNumLineBadgeAttributes).num,
        validator: (val: string) => !Number.isNaN(val),
        onChange: (val: string | number, attrs_: BjsubwayNumLineBadgeAttributes | undefined) => {
            // set default value if switched from another type
            const attrs = attrs_ ?? defaultBjsubwayNumLineBadgeAttributes;
            // return if invalid
            if (Number.isNaN(val)) return attrs;
            // set value
            attrs.num = Number(val);
            // return modified attrs
            return attrs;
        },
    },
    {
        type: 'custom',
        component: (
            <ColorField type={MiscNodeType.BjsubwayNumLineBadge} defaultAttrs={defaultBjsubwayNumLineBadgeAttributes} />
        ),
    },
];

const BjsubwayNumLineBadgeIcon = (
    <svg viewBox="0 0 24 24" height={40} width={40} focusable={false}>
        <rect fill="currentColor" x="2" y="4" width="20" height="16" rx="2" />
        <text x="4" y="17" fill="white" fontSize="14">
            1
        </text>
        <text x="11" y="11" fill="white" fontSize="5">
            号线
        </text>
        <text x="11" y="17" fill="white" fontSize="4">
            Line 1
        </text>
    </svg>
);

const bjsubwayNumLineBadge: Node<BjsubwayNumLineBadgeAttributes> = {
    component: BjsubwayNumLineBadge,
    icon: BjsubwayNumLineBadgeIcon,
    defaultAttrs: defaultBjsubwayNumLineBadgeAttributes,
    // TODO: fix this
    // @ts-ignore-error
    fields: BjsubwayNumLineBadgeFields,
    metadata: {
        displayName: 'panel.details.node.bjsubwayNumLineBadge.displayName',
        tags: [],
    },
};

export default bjsubwayNumLineBadge;