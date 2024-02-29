'use client';

import CustomSingleSelect from '@/app/components/atoms/CustomSingleSelect';
import CustomTextField from '@/app/components/atoms/CustomTextField';
import { ICreateAssessment, LevelOptions } from '@/app/constants/assessments';
import { IResponseQuestion } from '@/app/constants/questions';
import ApiHook, { Methods } from '@/app/lib/apis/ApiHook';
import { showNotification } from '@/app/lib/toast';
import { createAssessmentSchema } from '@/app/validations/assessment';
import { DevTool } from '@hookform/devtools';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddBox, Delete } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormGroup,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { IQuestion } from '../../questions/page';

interface IModifyAssessment {
  detail?: any;
}

export default function ModifyAssessment(props: IModifyAssessment) {
  const { detail } = props;
  const router = useRouter();
  const [questionList, setQuestionList] = useState<IQuestion[]>([]);

  useEffect(() => {
    getQuestionsList();
  }, []);

  const getQuestionsList = async () => {
    const _questions = await ApiHook(Methods.GET, '/questions');
    const _questionList: IQuestion[] = (
      _questions.data as Array<IResponseQuestion>
    ).map((q: IResponseQuestion) => {
      return {
        id: q.id,
        title: q.question,
        content: q.description,
        categories: new Array().concat(q.category),
        answers: q.answer,
        options: q.options,
        type: q.type,
      };
    });
    setQuestionList(_questionList);
  };

  const form = useForm<ICreateAssessment>({
    defaultValues: {
      name: '',
      level: '',
      questions: [''],
    },
    resolver: yupResolver(createAssessmentSchema),
  });
  const { control, watch } = form;

  useEffect(() => {
    if (!!detail) {
      const { assessmentQuestionMapping, id, level, name } = detail;
      const questions = assessmentQuestionMapping.map(
        (item: any) => item.question.id,
      );
      form.reset((prevState) => ({
        ...prevState,
        id,
        level,
        name,
        questions: questions.length ? questions : prevState.questions,
      }));
    }
  }, [detail]);

  const { append, remove } = useFieldArray<any>({
    control,
    name: 'questions',
  });

  const questions = watch('questions');

  const submit = () => {
    if (!!detail?.id) {
      handleEdit();
    } else {
      handleAddNew();
    }
  };

  const handleAddNew = async () => {
    const formData = form.getValues();
    const { error } = await ApiHook(Methods.POST, '/assessments', {
      data: formData,
    });
    !error && showNotification('Create new assessment successfully', 'success');
  };

  const handleEdit = async () => {
    const formData = form.getValues();
    const { error } = await ApiHook(Methods.PUT, `/assessments/${detail.id}`, {
      data: formData,
    });
    !error && showNotification('Update assessment successfully', 'success');
  };

  const questionOptions = useMemo(() => {
    return questionList.map((item) => ({
      label: item.title,
      value: item.id,
    }));
  }, [questionList]);

  return (
    <Box sx={{ overflow: "auto" }}>
      <Box className="flex items-center justify-between">
        <Typography component="h1" className={`text-xl md:text-2xl mb-10`}>
          {detail ? 'Edit' : 'New'} Assessment
        </Typography>
      </Box>
      <FormProvider {...form}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          className="flex flex-row"
        >
          <Box className="!w-1/2">
            <FormControl variant="standard" className="!w-11/12 pb-7">
              <Typography className="font-semibold">Name</Typography>
              <CustomTextField
                name="name"
                id="question-title-input"
                className="ring-offset-0 full-width"
                multiline
                maxRows={5}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
              />
            </FormControl>
            <FormControl variant="standard" className="!w-11/12 pb-7">
              <Typography className="font-semibold">Level</Typography>
              <CustomSingleSelect
                name="level"
                options={LevelOptions}
              />
            </FormControl>
            <FormGroup className="!w-11/12 pb-7">
              <Typography className="font-semibold">Questions</Typography>
              <Box
                sx={{ overflowY: "auto", maxHeight: 300, width: "100%" }}
              >
                {(questions || []).map((question, index) => (
                  <Stack
                    key={`question-${question}`}
                    alignItems="center"
                    justifyContent="flex-start"
                    direction="row"
                    gap={1}
                  >
                    <Typography className="font-semibold">{index + 1}.</Typography>
                    <CustomSingleSelect
                      name={`questions.${index}`}
                      options={questionOptions}
                    />
                    <IconButton color="primary" onClick={() => append('')} sx={{ display: index + 1 === questions?.length ?  "block": "none"}}>
                      <AddBox />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(index)} disabled={questions?.length === 1}>
                      <Delete />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            </FormGroup>
          </Box>
        </Box>
        <ButtonGroup className="footer action-buttons inline-flex w-full justify-end gap-2">
          <Button
            variant="contained"
            startIcon={<LibraryAddIcon />}
            onClick={form.handleSubmit(submit)}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </ButtonGroup>
        <DevTool control={control} />
      </FormProvider>
    </Box>
  );
}
