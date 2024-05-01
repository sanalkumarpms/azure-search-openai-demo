import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    { text: "Where can I find preliminary bid results?", value: "Where can I find preliminary bid results?" },
    { text: "How long it takes for Port Authority to make a payment?", value: "How long it takes for Port Authority to make a payment?" },
    { text: "Who can I talk to about active procurement?", value: "Who can I talk to about active procurement?" }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
