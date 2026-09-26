import React from "react";
import { X, Send, Info } from "lucide-react";
import { IconBox, Button, Field } from "./UIComponents";

export function ConsentModal() {
  return (
    <div className="modalOverlay">
      <div className="modal">
        <button className="x"><X /></button>
        <h2>Send Consent to Doctor</h2>
        <p>Request doctor's consent to use their details, photo and information for personalized calendar.</p>
        <div className="modalBody">
          <IconBox icon={Send} tone="blue" />
          <div className="stack">
            <Field label="Doctor Name" />
            <Field label="Email ID" />
            <div className="formGrid twoCol">
              <Field label="Mobile Number" />
              <Field label="Preferred Contact" custom={
                <div className="radio">
                  <span />Email <span className="on" />Mobile
                </div>
              } />
            </div>
            <Field label="Personalized Message (Optional)" textarea />
          </div>
        </div>
        <div className="notice">
          <Info size={18} />
          The doctor will receive an email/SMS with consent form link. Once approved, you can proceed.
        </div>
        <div className="modalActions">
          <Button variant="outline">Cancel</Button>
          <Button icon={Send}>Send Consent</Button>
        </div>
      </div>
    </div>
  );
}

export function InputGivenModal() {
  return (
    <div className="modalOverlay">
      <div className="modal small">
        <button className="x"><X /></button>
        <h2>Mark Input Given</h2>
        <p>Provide the handover details to mark the calendar as Input Given.</p>
        <div>
          {[
            "Doctor Name: Dr. Rajesh Shah",
            "MCL Code: MCL10291",
            "Calendar Year: 2027",
            "Calendar Status: Calendar Frozen",
          ].map((x) => {
            const [a, b] = x.split(": ");
            return (
              <p key={x}>
                <span>{a}</span> <b>{b}</b>
              </p>
            );
          })}
        </div>
        <Field label="Input Given Date *" />
        <Field label="Remarks (Optional)" textarea />
        <div className="modalActions">
          <Button variant="outline">Cancel</Button>
          <Button>Confirm Input Given</Button>
        </div>
      </div>
    </div>
  );
}