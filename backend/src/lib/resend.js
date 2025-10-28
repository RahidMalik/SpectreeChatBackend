import { Resend } from "resend";
import { ENV } from "../lib/env.js";


export const resendEmail = new Resend(ENV.RESEND_API_KEY);

export const sender = {
    email: ENV.EMAIL_FORM,
    name: ENV.EMAIL_FORM_NAME,
};
