import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ProviderConfigField } from './ProviderConfigField'

describe('ProviderConfigField', () => {
  test('should render basic text input field', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test value"
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
  })

  test('should render password input when type is password', () => {
    render(
      <ProviderConfigField
        id="test-password"
        label="Password"
        value="secret"
        onChange={vi.fn()}
        type="password"
      />
    )

    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  test('should call onChange when input value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<ProviderConfigField id="test-field" label="Test Label" value="" onChange={onChange} />)

    const input = screen.getByLabelText('Test Label')
    await user.type(input, 'new value')

    expect(onChange).toHaveBeenCalledWith('n')
    expect(onChange).toHaveBeenCalledWith('e')
    expect(onChange).toHaveBeenCalledTimes(9) // "new value" = 9 characters
  })

  test('should show environment variable badge when envBadge is true', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={true}
      />
    )

    expect(screen.getByText('Environment variable')).toBeInTheDocument()
  })

  test('should not show environment variable badge when envBadge is false', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={false}
      />
    )

    expect(screen.queryByText('Environment variable')).not.toBeInTheDocument()
  })

  test('should show environment hint when envBadge and envHint are provided', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={true}
        envHint="Value set by TERMAID_TEST"
      />
    )

    expect(screen.getByText('Value set by TERMAID_TEST')).toBeInTheDocument()
  })

  test('should not show environment hint when envBadge is false', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={false}
        envHint="Value set by TERMAID_TEST"
      />
    )

    expect(screen.queryByText('Value set by TERMAID_TEST')).not.toBeInTheDocument()
  })

  test('should disable input when disabled prop is true', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        disabled={true}
      />
    )

    const input = screen.getByLabelText('Test Label') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  test('should apply env-readonly class when disabled', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        disabled={true}
      />
    )

    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass('env-readonly')
  })

  test('should not apply env-readonly class when not disabled', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        disabled={false}
      />
    )

    const input = screen.getByLabelText('Test Label')
    expect(input).not.toHaveClass('env-readonly')
  })

  test('should render placeholder text', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value=""
        onChange={vi.fn()}
        placeholder="Enter value here"
      />
    )

    expect(screen.getByPlaceholderText('Enter value here')).toBeInTheDocument()
  })

  test('should render custom children instead of default input', () => {
    render(
      <ProviderConfigField id="test-field" label="Test Label" value="test" onChange={vi.fn()}>
        <select data-testid="custom-select">
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </ProviderConfigField>
    )

    expect(screen.getByTestId('custom-select')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  test('should show env hint with custom children', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={true}
        envHint="Custom hint text"
      >
        <select data-testid="custom-select">
          <option>Option 1</option>
        </select>
      </ProviderConfigField>
    )

    expect(screen.getByTestId('custom-select')).toBeInTheDocument()
    expect(screen.getByText('Custom hint text')).toBeInTheDocument()
  })

  test('should render complex envHint with JSX elements', () => {
    render(
      <ProviderConfigField
        id="test-field"
        label="Test Label"
        value="test"
        onChange={vi.fn()}
        envBadge={true}
        envHint={
          <>
            Value set by <code>TERMAID_API_KEY</code> or <code>ANTHROPIC_API_KEY</code>
          </>
        }
      />
    )

    expect(screen.getByText('Value set by', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('TERMAID_API_KEY')).toBeInTheDocument()
    expect(screen.getByText('ANTHROPIC_API_KEY')).toBeInTheDocument()
  })
})
