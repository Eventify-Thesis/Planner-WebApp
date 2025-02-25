import React, { useState } from 'react';
import { Dates } from '@/constants/Dates';
import { BaseHashTag, IHashTag } from '../BaseHashTag/BaseHashTag';
import { BaseImage } from '../BaseImage/BaseImage';
import { BaseAvatar } from '../BaseAvatar/BaseAvatar';
import * as S from './BaseHistoryJob.styles';
import { useTranslation } from 'react-i18next';
import { BaseButton } from '../BaseButton/BaseButton';
import { HistoryJobListResponse } from '@/api/jobs.api';
import { BaseModal } from '../BaseModal/BaseModal';
import logo from 'assets/logo_svg.svg';
import { formatDate } from '@/utils/utils';
import { JobDetail } from '@/components/jobDetail/JobDetail';

export interface BaseHistoryJobProps {
  job: HistoryJobListResponse;
}

export const BaseHistoryJob: React.FC<BaseHistoryJobProps> = ({ job }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleOnCardClick = () => {
    setModalOpen(true);
    console.log('Data: ', job);
  };

  // Log job to verify the structure

  return (
    <>
      <S.HistoryJobCard onClick={handleOnCardClick}>
        <S.Wrapper>
          <S.ImgWrapper>
            <img
              src={job.companyImageUrl}
              alt={job.company}
              width={84}
              height={84}
              onError={(e) => (e.currentTarget.src = logo)}
            />
          </S.ImgWrapper>

          <S.InfoWrapper>
            <S.InfoHeaderWrapper>
              <S.TitleWrapper>
                <S.Title level={5}>{job.title}</S.Title>
              </S.TitleWrapper>
              <S.LabelWrapper>
                {job.type && job.type !== 'ANY' ? (
                  <S.Label>{job.type}</S.Label>
                ) : null}

                {job.experience && <S.Label>{job.experience}</S.Label>}
                {job.status && <S.Label>{job.status}</S.Label>}
              </S.LabelWrapper>
            </S.InfoHeaderWrapper>

            <S.InfoBottomWrapper>
              <S.Text>
                {job.location ? job.location : 'Location provided'}
              </S.Text>
              <S.DateText>
                {job.date ? formatDate(job.date) : 'No Date'}
              </S.DateText>
            </S.InfoBottomWrapper>
          </S.InfoWrapper>
        </S.Wrapper>
      </S.HistoryJobCard>
      <BaseModal
        centered
        open={isModalOpen}
        onOk={(e) => {
          e.stopPropagation();
          setModalOpen(false);
        }}
        onCancel={(e) => {
          e.stopPropagation();
          setModalOpen(false);
        }}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
        // width={'100%'}
      >
        <JobDetail id={job.id} />
      </BaseModal>
    </>
  );
};
