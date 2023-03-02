import React from 'react';
import SweetAlert from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Spinner } from 'react-bootstrap';

const Swal = withReactContent(SweetAlert);

const SwalError = (errMessage = '500: Something went wrong!') => Swal.fire({
  icon: 'error',
  title: 'Error',
  text: errMessage,
});

const htmlLoading = (
  <div className="d-flex justify-content-center align-items-center flex-row w-100 gap-2">
    <Spinner animation="grow" />
    <Spinner animation="grow" />
    <Spinner animation="grow" />
  </div>
);

export interface SwalSubmitProps {
    onSubmit: () => Promise<any>;
    text?:string;
    onSuccess?: (res: any) => any;
    successText?: string;
    waitingText?: string;
}

const SwalSubmit = ({
  onSubmit, onSuccess,
  text = 'Are you sure want to submit your data?',
  successText = 'Success submit data!',
  waitingText = 'Please wait a moment...',
} : SwalSubmitProps) => (
  Swal.fire({
    icon: 'warning',
    text,
    showCancelButton: true,
    reverseButtons: true,
  })
    .then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: waitingText,
          html: htmlLoading,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
        });
        onSubmit()
          .then((res:any) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: res?.message ?? successText,
              allowOutsideClick: false,
            }).then(() => (onSuccess ? onSuccess(res) : null));
          })
          .catch((e: any) => SwalError(e?.response?.data?.message ?? e?.message ?? 'Something went wrong!'));
      }
    }).catch((e) => SwalError(e))
);

export { Swal, SwalError, SwalSubmit };
