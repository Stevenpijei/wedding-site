import React from 'react'
import { IFaq } from './types'
import { GlobeIcon, VideosIcon, VendorsIcon, HeartIconPlain } from '/components/Utility/LSTVSVG'
import theme from '../../../../styledComponentsTheme'
import * as S from './FaqMenuBar.styles'
import useHover from '/hooks/useHover'

const FaqMenuItem = ({ faq, selected, onClick }: {
  faq: IFaq,
  selected?: boolean,
  onClick: (id: string) => void
}) => {
  const [ref, hovered] = useHover()  
  const color = selected || hovered ? theme.primaryPurple : theme.black
  let icon

  switch (faq.id) {
    case 'everyone':
      icon = <GlobeIcon fillColor={color} />
      break;
    case 'filmmakers':
      icon = <VideosIcon fillColor={color} />
      break;
    case 'pros':
      icon = <VendorsIcon fillColor={color} />
      break
    case 'couples':
      icon = <HeartIconPlain fillColor={color} />
      break
  }

  return (
    <S.ItemContainer ref={ref} selected={selected} onClick={() => onClick(faq.id)}>
      <S.Icon>{ icon }</S.Icon>
      <S.Title>{ faq.title }</S.Title>
    </S.ItemContainer>
  )
}

const FaqMenuBar = ({ faqs, selected, onChange }: {
  faqs: IFaq[],
  selected: string,
  onChange: (id: string) => void
}) => {
  return (
    <S.MenuBarContainer>
      {
        faqs.map((faq, index) =>
            <FaqMenuItem
              key={index}
              faq={faq}
              selected={faq.id === selected}
              onClick={() => onChange(faq.id)}
            />
        )
      }
    </S.MenuBarContainer>
  )
}

export default FaqMenuBar