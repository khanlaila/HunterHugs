import "./SearchBar.css";

function SearchBar({
  value,
  onChange,
  onSubmit = (event) => event.preventDefault(),
  placeholder,
  buttonLabel,
  formClassName = "",
  inputClassName = "",
  buttonClassName = "",
}) {
  return (
    <form className={`search-bar-form ${formClassName}`} onSubmit={onSubmit}>
      <input
        className={`search-bar-input ${inputClassName}`}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {buttonLabel ? (
        <button className={`search-bar-button ${buttonClassName}`} type="submit">
          {buttonLabel}
        </button>
      ) : null}
    </form>
  );
}

export default SearchBar;
