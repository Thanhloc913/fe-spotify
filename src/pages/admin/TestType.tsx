// Component that accepts a {[key: string]: any} type
// Unexpected any. Specify a different type.eslint@typescript-eslint/no-explicit-any
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type GenericProps = JsonObject;

const GenericComponent: React.FC<GenericProps> = (props) => {
  return (
    <div>
      {Object.entries(props).map(([key, value]) => (
        <p key={key}>
          {key}: {JSON.stringify(value)}
        </p>
      ))}
    </div>
  );
};

// Interface for specific type
interface SpecificProps {
  name: string;
  age: number;
  isAdmin: boolean;
}

// Component that uses GenericComponent with a specific type
const SpecificComponent: React.FC<SpecificProps> = (props) => {
  return <GenericComponent {...props} />;
};

export default SpecificComponent;
