export default function SmartSearchBar({
  value,
  onChange,
  placeholder = 'Search records...',
  total = 0,
  filtered = 0,
  filters = [],
  chips = [],
  onClear,
}) {
  const hasSearch = String(value || '').trim().length > 0;
  const hasFilter = filters.some((filter) => filter.value && filter.value !== 'ALL');
  const activeChips = chips.filter(Boolean);

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    onChange('');
  };

  return (
    <div className="smart-search glass">
      <div className="smart-search-main">
        <div className="smart-search-icon">⌕</div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {(hasSearch || hasFilter) && (
          <button type="button" className="clear-search" onClick={handleClear}>Clear</button>
        )}
      </div>

      {!!filters.length && (
        <div className="smart-filter-row">
          {filters.map((filter) => (
            <label key={filter.name} className="smart-filter">
              <span>{filter.label}</span>
              <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
                {(filter.options || []).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      <div className="smart-search-footer">
        <span>{filtered} of {total} records</span>
        {!!activeChips.length && (
          <div className="search-chips">
            {activeChips.map((chip) => <span key={chip}>{chip}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
