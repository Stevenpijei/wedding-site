import parse from 'html-react-parser'
import React, { useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { IFaq, IQuestion } from "./types"
import { CircleMinus, CirclePlus } from '/components/Utility/LSTVSVG'
import * as globals from '/global/globals'
import * as S from './FaqQuestions.styles'

const FaqQuestion = ({ question, id }: {
  question: IQuestion,
  id: string
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <S.FaqQuestionContainer>
      <S.QuestionTarget onClick={() => setExpanded(!expanded)}>
        <h5>
          { question.q }
        </h5>
        <div style={{ width: 35, height: 35, flexShrink: 0 }}>
          { expanded ? <CircleMinus /> : <CirclePlus /> }
        </div>
      </S.QuestionTarget>
      
      <AnimateHeight
        id={id}
        duration={globals.SIDEBAR_ACCORDION_SPEED}
        height={expanded ? 'auto' : 0}
        animateOpacity
      >
        <S.Answer>
          { parse(question.a) }
        </S.Answer>
      </AnimateHeight>
    </S.FaqQuestionContainer>
  )
}

const FaqQuestions = ({ faqs, selected }: {
  faqs: IFaq[],
  selected: string
}) => {
  return (
    <S.Container>
      {
        faqs.map(faq => 
          <S.QuestionSet key={faq.id} selected={faq.id === selected}>
            {
              faq.questions.map((question, index) =>
                <FaqQuestion
                  key={index}
                  id={`q${index}`}
                  question={question}
                />
              )
            }
          </S.QuestionSet>
        )
      }
    </S.Container>
  )
}

export default FaqQuestions