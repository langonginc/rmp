import React from 'react';
import { CityCode, MonoColour } from '@railmapgen/rmg-palette-resources';
import { LinePathAttributes, LinePathType, LineStyle, LineStyleComponentProps } from '../../../../constants/lines';
import { AttributesWithColor } from '../../../panels/details/color-field';

const River = (props: LineStyleComponentProps<RiverAttributes>) => {
    const { id, path, styleAttrs, handleClick } = props;
    const { color = defaultRiverAttributes.color, width = defaultRiverAttributes.width } =
        styleAttrs ?? defaultRiverAttributes;

    const onClick = React.useCallback(
        (e: React.MouseEvent<SVGPathElement, MouseEvent>) => handleClick(id, e),
        [id, handleClick]
    );

    return (
        <path
            id={id}
            d={path}
            fill="none"
            stroke={color[2]}
            strokeWidth={width}
            strokeLinecap="round"
            cursor="pointer"
            onClick={onClick}
        />
    );
};

/**
 * River specific props.
 */
export interface RiverAttributes extends LinePathAttributes, AttributesWithColor {
    width: number;
}

const defaultRiverAttributes: RiverAttributes = {
    color: [CityCode.Shanghai, 'river', '#9EE3F9', MonoColour.white],
    width: 20,
};

const riverFields = [
    {
        type: 'input',
        label: 'panel.details.line.river.width',
        variant: 'number',
        value: (attrs?: RiverAttributes) => (attrs ?? defaultRiverAttributes).width,
        onChange: (val: string | number, attrs_: RiverAttributes | undefined) => {
            // set default value if switched from another type
            const attrs = attrs_ ?? defaultRiverAttributes;
            // set value
            attrs.width = Number(val);
            // return modified attrs
            return attrs;
        },
    },
];

const river: LineStyle<RiverAttributes> = {
    component: River,
    defaultAttrs: defaultRiverAttributes,
    // TODO: fix this
    // @ts-ignore-error
    fields: riverFields,
    metadata: {
        displayName: 'panel.details.line.river.displayName',
        supportLinePathType: [LinePathType.Diagonal, LinePathType.Perpendicular, LinePathType.Simple],
    },
};

export default river;
