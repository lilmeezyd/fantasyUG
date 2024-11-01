import {
    BsChevronLeft,
    BsChevronRight,
    BsChevronDoubleLeft,
    BsChevronDoubleRight,
  } from "react-icons/bs";
  import { Form } from "react-bootstrap";
const Pagination = (props) => {
    const { curPage, viewFirstPage, viewPreviousPage,
        viewNextPage, viewLastPage,
         totalPages, onSubmit, page, changePage } = props
  return (
    <div className="button-controls">
    <button
      disabled={curPage === 1 ? true : false}
      onClick={viewFirstPage}
      className="btn-controls"
      id="firstPage"
    >
      <BsChevronDoubleLeft />
    </button>
    <button
      disabled={curPage === 1 ? true : false}
      onClick={viewPreviousPage}
      className="btn-controls"
      id="prevButton"
    >
      <BsChevronLeft />
    </button>
    <div className="pages">
      <Form onSubmit={onSubmit} className="mx-2">
        <Form.Group className="my-2 current" controlId="curPage">
          <Form.Control
            type="number"
            value={curPage}
            onChange={changePage}
            min="1"
            max={totalPages}
          ></Form.Control>
        </Form.Group>
      </Form>
      <span>of</span>
      <span className="mx-2 total_pages">{totalPages}</span>
    </div>
    <button
      disabled={curPage === totalPages ? true : false}
      onClick={viewNextPage}
      className="btn-controls"
      id="nextButton"
    >
      <BsChevronRight />
    </button>
    <button
      disabled={curPage === totalPages ? true : false}
      onClick={viewLastPage}
      className="btn-controls"
      id="lastPage"
    >
      <BsChevronDoubleRight />
    </button>
  </div>
  )
}

export default Pagination