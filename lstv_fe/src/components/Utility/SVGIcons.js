import React from "react";
import BusinessIcons from "../../images/svg_icons.svg";
import styled from "styled-components";

const SVGStyle = styled.svg`
	
	
`;

export const SVGIcon = props => {
	return (
		<SVGStyle
			width={ props.width ? props.width : "100%" }
			height={ props.height ? props.height : "100%" }
			version="1.1" id="Layer_1" x="0px" y="0px"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink">
			<use xlinkHref={`${BusinessIcons}#${props.icon}`} />
		</SVGStyle>
	);
};
